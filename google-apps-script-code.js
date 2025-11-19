// ============================================
// Google Apps Script - 상담 신청 폼 연동
// ============================================

// Google Sheets ID (스프레드시트 URL에서 /d/ 다음의 문자열)
const SPREADSHEET_ID = '1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI';

// 스프레드시트 가져오기
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// 시트 가져오기 (없으면 생성)
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // Contacts 시트 헤더 설정
    if (sheetName === 'Contacts') {
      sheet.getRange(1, 1, 1, 8).setValues([[
        'ID', '이름', '이메일', '전화번호', '서비스', '메시지', '읽음', '생성일시'
      ]]);
      
      // 헤더 스타일
      const headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f0f0f0');
      headerRange.setFontSize(11);
      
      // 컬럼 너비 조정
      sheet.setColumnWidth(1, 60);   // ID
      sheet.setColumnWidth(2, 100);  // 이름
      sheet.setColumnWidth(3, 200);  // 이메일
      sheet.setColumnWidth(4, 120);  // 전화번호
      sheet.setColumnWidth(5, 150);  // 서비스
      sheet.setColumnWidth(6, 300);  // 메시지
      sheet.setColumnWidth(7, 80);   // 읽음
      sheet.setColumnWidth(8, 180);  // 생성일시
    }
  }
  
  return sheet;
}

// JSON 응답 생성
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET 요청 처리 (데이터 읽기)
function doGet(e) {
  const action = e.parameter.action;
  const sheetName = e.parameter.sheetName;
  
  if (action === 'read' && sheetName) {
    try {
      const sheet = getSheet(sheetName);
      const data = sheet.getDataRange().getValues();
      return createResponse(data);
    } catch (error) {
      return createResponse({ error: error.toString() });
    }
  }
  
  return createResponse({ error: 'Invalid action or missing sheetName' });
}

// POST 요청 처리 (데이터 추가/수정/삭제)
function doPost(e) {
  let requestData;
  
  try {
    // POST 데이터 파싱
    if (e.postData && e.postData.contents) {
      const contentType = e.postData.type || '';
      
      if (contentType.indexOf('application/json') !== -1) {
        // JSON 형식
        requestData = JSON.parse(e.postData.contents);
      } else {
        // form-urlencoded 형식
        requestData = parseFormData(e.postData.contents);
      }
    } else if (e.parameter) {
      // GET 파라미터로 전송된 경우
      requestData = {
        action: e.parameter.action,
        sheetName: e.parameter.sheetName,
        data: e.parameter.data ? JSON.parse(e.parameter.data) : null,
        rowIndex: e.parameter.rowIndex ? parseInt(e.parameter.rowIndex) : null
      };
    } else {
      return createResponse({ error: 'No data received' });
    }
    
    const action = requestData.action;
    const sheetName = requestData.sheetName;
    
    if (!action || !sheetName) {
      return createResponse({ error: 'Missing action or sheetName' });
    }
    
    const sheet = getSheet(sheetName);
    
    // 액션별 처리
    if (action === 'add') {
      return handleAdd(sheet, requestData.data);
    } else if (action === 'update') {
      return handleUpdate(sheet, requestData.rowIndex, requestData.data);
    } else if (action === 'delete') {
      return handleDelete(sheet, requestData.rowIndex);
    } else {
      return createResponse({ error: 'Invalid action: ' + action });
    }
    
  } catch (error) {
    return createResponse({ error: 'Error: ' + error.toString() });
  }
}

// form-urlencoded 데이터 파싱
function parseFormData(contents) {
  const params = {};
  const pairs = contents.split('&');
  
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    if (pair.length === 2) {
      const key = decodeURIComponent(pair[0]);
      const value = decodeURIComponent(pair[1].replace(/\+/g, ' '));
      params[key] = value;
    }
  }
  
  // data 필드가 JSON 문자열인 경우 파싱
  if (params.data) {
    try {
      params.data = JSON.parse(params.data);
    } catch (e) {
      // JSON이 아니면 그대로 사용
    }
  }
  
  // rowIndex를 숫자로 변환
  if (params.rowIndex) {
    params.rowIndex = parseInt(params.rowIndex);
  }
  
  return params;
}

// 데이터 추가
function handleAdd(sheet, data) {
  try {
    // ID 자동 생성
    const lastRow = sheet.getLastRow();
    let newId = 1;
    
    if (lastRow > 1) {
      const idRange = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      const ids = idRange.map(row => parseInt(row[0]) || 0);
      newId = Math.max(...ids, 0) + 1;
    }
    
    // 데이터 배열 준비
    let rowData;
    if (Array.isArray(data)) {
      rowData = [...data];
      // ID가 없거나 빈 값이면 자동 생성된 ID로 교체
      if (!rowData[0] || rowData[0] === '') {
        rowData[0] = newId;
      }
    } else {
      return createResponse({ error: 'Data must be an array' });
    }
    
    // 행 추가
    sheet.appendRow(rowData);
    
    return createResponse({ success: true, id: newId });
  } catch (error) {
    return createResponse({ error: 'Add error: ' + error.toString() });
  }
}

// 데이터 수정
function handleUpdate(sheet, rowIndex, data) {
  try {
    if (!rowIndex || rowIndex < 2) {
      return createResponse({ error: 'Invalid row index' });
    }
    
    if (!Array.isArray(data)) {
      return createResponse({ error: 'Data must be an array' });
    }
    
    sheet.getRange(rowIndex, 1, 1, data.length).setValues([data]);
    
    return createResponse({ success: true });
  } catch (error) {
    return createResponse({ error: 'Update error: ' + error.toString() });
  }
}

// 데이터 삭제
function handleDelete(sheet, rowIndex) {
  try {
    if (!rowIndex || rowIndex < 2) {
      return createResponse({ error: 'Invalid row index' });
    }
    
    sheet.deleteRow(rowIndex);
    
    return createResponse({ success: true });
  } catch (error) {
    return createResponse({ error: 'Delete error: ' + error.toString() });
  }
}
