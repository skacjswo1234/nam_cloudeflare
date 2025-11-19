// Google Sheets API 유틸리티
// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFcbUK6uz3_J1jbT-c6DTdpMV5RvTo7dX4Q-fjUOaYvtajQ6M44sFGF0xr6kTzY4pWtA/exec';

/**
 * Google Sheets에 데이터 추가
 * @param {string} sheetName - 시트 이름
 * @param {Array} data - 추가할 데이터 배열
 * @returns {Promise} 응답 데이터
 */
async function addToSheet(sheetName, data) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'add',
                sheetName: sheetName,
                data: data
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error adding to sheet:', error);
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
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update',
                sheetName: sheetName,
                rowIndex: rowIndex,
                data: data
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating sheet:', error);
        throw error;
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
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete',
                sheetName: sheetName,
                rowIndex: rowIndex
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting from sheet:', error);
        throw error;
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

