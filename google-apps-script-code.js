// Google Sheets ID를 여기에 입력하세요
// Google Sheets URL에서 /d/ 다음의 문자열을 복사하세요
const SPREADSHEET_ID = '1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI';

// 스프레드시트 가져오기
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// 시트 가져오기
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  // 시트가 없으면 생성
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // 헤더 설정 (Contacts 시트만 생성)
    if (sheetName === 'Contacts') {
      sheet.getRange(1, 1, 1, 8).setValues([[
        'ID', '이름', '이메일', '전화번호', '서비스', '메시지', '읽음', '생성일시'
      ]]);
    }
    
    // 헤더 스타일 설정
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');
    headerRange.setFontSize(11);
  }
  
  return sheet;
}

// 데이터 읽기
function doGet(e) {
  const sheetName = e.parameter.sheetName;
  const action = e.parameter.action;
  
  if (action === 'read') {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 데이터 추가/수정/삭제
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const sheetName = data.sheetName;
  const sheet = getSheet(sheetName);
  
  try {
    if (action === 'add') {
      // ID 자동 생성 (현재 최대 ID + 1)
      const lastRow = sheet.getLastRow();
      let newId = 1;
      
      if (lastRow > 1) {
        // 모든 행의 ID를 확인하여 최대값 찾기
        const idRange = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        const ids = idRange.map(row => parseInt(row[0]) || 0);
        newId = Math.max(...ids, 0) + 1;
      }
      
      // 데이터 배열에 ID 추가 (ID가 없을 경우)
      let rowData;
      if (data.data && data.data.length > 0 && data.data[0] === '') {
        // 첫 번째 요소가 빈 문자열이면 ID로 교체
        rowData = [newId, ...data.data.slice(1)];
      } else if (data.data && data.data.length > 0 && !data.data[0]) {
        // 첫 번째 요소가 없으면 ID 추가
        rowData = [newId, ...data.data];
      } else {
        // ID가 이미 있으면 그대로 사용
        rowData = data.data || [];
        if (rowData.length > 0 && (!rowData[0] || rowData[0] === '')) {
          rowData[0] = newId;
        }
      }
      
      // 행 추가
      sheet.appendRow(rowData);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, id: newId }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (action === 'update') {
      const rowIndex = data.rowIndex;
      const rowData = data.data;
      
      if (!rowIndex || rowIndex < 2) {
        throw new Error('Invalid row index');
      }
      
      // 행 업데이트
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (action === 'delete') {
      const rowIndex = data.rowIndex;
      
      if (!rowIndex || rowIndex < 2) {
        throw new Error('Invalid row index');
      }
      
      // 행 삭제
      sheet.deleteRow(rowIndex);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

