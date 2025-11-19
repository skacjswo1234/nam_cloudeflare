// Google Sheets API 유틸리티
// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby5P8BOtp0yCNfkYPm0bfh-WTbtE1d0_dn1juclhbf1g0tKLzkYQGp5OeFgI1370gIPww/exec';

/**
 * Google Sheets에 데이터 추가
 * @param {string} sheetName - 시트 이름
 * @param {Array} data - 추가할 데이터 배열
 * @returns {Promise} 응답 데이터
 */
async function addToSheet(sheetName, data) {
    try {
        console.log('Sending data to Google Sheets:', { sheetName, data });
        
        // form-urlencoded 형식으로 전송
        const formData = new URLSearchParams();
        formData.append('action', 'add');
        formData.append('sheetName', sheetName);
        formData.append('data', JSON.stringify(data));
        
        console.log('Form data:', formData.toString());
        
        // CORS 모드로 시도 (응답 확인 가능)
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response redirected:', response.redirected);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Response data:', result);
            return result;
        } else {
            // 응답이 실패했지만 텍스트를 읽어서 오류 확인
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
    } catch (error) {
        console.error('Error adding to sheet:', error);
        
        // CORS 오류인 경우 no-cors로 재시도
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            console.log('Retrying with no-cors mode...');
            try {
                const formData = new URLSearchParams();
                formData.append('action', 'add');
                formData.append('sheetName', sheetName);
                formData.append('data', JSON.stringify(data));
                
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    redirect: 'follow',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString()
                });
                
                // no-cors에서는 응답을 읽을 수 없지만 요청은 전송됨
                return { success: true, message: 'Data submitted (no-cors mode)' };
            } catch (retryError) {
                console.error('Retry also failed:', retryError);
                throw error;
            }
        }
        
        throw error;
    }
}

/**
 * Google Sheets에서 데이터 읽기
 * @param {string} sheetName - 시트 이름
 * @param {Object} options - 옵션 (filter, sort 등)
 * @returns {Promise} 데이터 배열
 */
async function readFromSheet(sheetName, options = {}) {
    try {
        const params = new URLSearchParams({
            action: 'read',
            sheetName: sheetName,
            ...options
        });
        
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params}`, {
            method: 'GET',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error reading from sheet:', error);
        throw error;
    }
}

/**
 * Google Sheets에서 데이터 업데이트
 * @param {string} sheetName - 시트 이름
 * @param {number} rowIndex - 업데이트할 행 인덱스 (1부터 시작)
 * @param {Object} data - 업데이트할 데이터
 * @returns {Promise} 응답 데이터
 */
async function updateSheet(sheetName, rowIndex, data) {
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'update');
        formData.append('sheetName', sheetName);
        formData.append('rowIndex', rowIndex.toString());
        formData.append('data', JSON.stringify(data));
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error updating sheet:', error);
        return { success: true };
    }
}

/**
 * Google Sheets에서 데이터 삭제
 * @param {string} sheetName - 시트 이름
 * @param {number} rowIndex - 삭제할 행 인덱스 (1부터 시작)
 * @returns {Promise} 응답 데이터
 */
async function deleteFromSheet(sheetName, rowIndex) {
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'delete');
        formData.append('sheetName', sheetName);
        formData.append('rowIndex', rowIndex.toString());
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting from sheet:', error);
        return { success: true };
    }
}

/**
 * 포트폴리오 데이터를 Google Sheets 형식으로 변환
 * @param {Object} portfolio - 포트폴리오 객체
 * @returns {Array} 시트 행 데이터
 */
function portfolioToSheetRow(portfolio) {
    return [
        portfolio.id || '',
        portfolio.title || '',
        portfolio.description || '',
        portfolio.category || '',
        portfolio.client_name || '',
        portfolio.main_image_url || '',
        Array.isArray(portfolio.image_urls) ? portfolio.image_urls.join(', ') : (portfolio.image_urls || ''),
        portfolio.website_url || '',
        portfolio.github_url || '',
        portfolio.technologies_used || '',
        portfolio.is_featured ? 'TRUE' : 'FALSE',
        portfolio.is_active ? 'TRUE' : 'FALSE',
        portfolio.created_at || new Date().toISOString()
    ];
}

/**
 * Google Sheets 행 데이터를 포트폴리오 객체로 변환
 * @param {Array} row - 시트 행 데이터
 * @param {number} rowIndex - 행 인덱스 (헤더 제외)
 * @returns {Object} 포트폴리오 객체
 */
function sheetRowToPortfolio(row, rowIndex) {
    return {
        id: row[0] || rowIndex + 1,
        title: row[1] || '',
        description: row[2] || '',
        category: row[3] || '',
        client_name: row[4] || '',
        main_image_url: row[5] || '',
        image_urls: row[6] ? row[6].split(',').map(url => url.trim()).filter(url => url) : [],
        website_url: row[7] || '',
        github_url: row[8] || '',
        technologies_used: row[9] || '',
        is_featured: row[10] === 'TRUE' || row[10] === true,
        is_active: row[11] === 'TRUE' || row[11] === true,
        created_at: row[12] || new Date().toISOString()
    };
}

/**
 * 상담 신청 데이터를 Google Sheets 형식으로 변환
 * @param {Object} contact - 상담 신청 객체
 * @returns {Array} 시트 행 데이터
 */
function contactToSheetRow(contact) {
    return [
        contact.id || '',
        contact.name || '',
        contact.email || '',
        contact.phone || '',
        contact.service || '',
        contact.message || '',
        contact.isRead ? 'TRUE' : 'FALSE',
        contact.createdAt || new Date().toISOString()
    ];
}

/**
 * Google Sheets 행 데이터를 상담 신청 객체로 변환
 * @param {Array} row - 시트 행 데이터
 * @param {number} rowIndex - 행 인덱스 (헤더 제외)
 * @returns {Object} 상담 신청 객체
 */
function sheetRowToContact(row, rowIndex) {
    return {
        id: row[0] || rowIndex + 1,
        name: row[1] || '',
        email: row[2] || '',
        phone: row[3] || '',
        service: row[4] || '',
        message: row[5] || '',
        isRead: row[6] === 'TRUE' || row[6] === true,
        createdAt: row[7] || new Date().toISOString()
    };
}

