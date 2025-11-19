// ============================================
// Google Apps Script - 상담 신청 폼 연동
// ============================================

// Google Sheets ID (스프레드시트 URL에서 /d/ 다음의 문자열)
const SPREADSHEET_ID = '1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI';

// ============================================
// 알림 설정
// ============================================

// 이메일 알림 받을 주소 (여러 개일 경우 쉼표로 구분)
const NOTIFICATION_EMAIL = '9078807@naver.com';

// IFTTT Webhook 알림 설정
// 1. https://ifttt.com 접속하여 계정 생성
// 2. "Create" 클릭하여 새 Applet 생성
// 3. "If This"에서 "Webhooks" 선택 > "Receive a web request" 선택
// 4. Event name 입력 (예: "new_consultation")
// 5. "Then That"에서 원하는 알림 방법 선택 (Push notification, Email, SMS 등)
// 6. Webhook URL에서 키 복사: https://maker.ifttt.com/use/{YOUR_KEY}
const IFTTT_WEBHOOK_KEY = ''; // 예: 'abc123xyz456'
const IFTTT_EVENT_NAME = 'new_consultation'; // 위에서 설정한 Event name

// 텔레그램 알림 설정
const TELEGRAM_BOT_TOKEN = '8323818112:AAHMFpJkFfZXVZh2krVharDpltHtkroowyI';
const TELEGRAM_CHAT_ID = '7973213508';

// 알림 사용 여부
const ENABLE_EMAIL_NOTIFICATION = true;     // 이메일 알림 사용
const ENABLE_TELEGRAM_NOTIFICATION = true;  // 텔레그램 알림 사용
const ENABLE_IFTTT_NOTIFICATION = false;    // IFTTT 알림 사용 (유료)

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
    // 디버깅: 받은 데이터 로깅
    Logger.log('POST received');
    Logger.log('postData: ' + JSON.stringify(e.postData));
    Logger.log('parameter: ' + JSON.stringify(e.parameter));

    // POST 데이터 파싱
    if (e.postData && e.postData.contents) {
      const contentType = e.postData.type || '';
      Logger.log('Content-Type: ' + contentType);
      Logger.log('Contents: ' + e.postData.contents);

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
      Logger.log('No data received');
      return createResponse({ error: 'No data received' });
    }

    Logger.log('Parsed data: ' + JSON.stringify(requestData));

    const action = requestData.action;
    const sheetName = requestData.sheetName;

    if (!action || !sheetName) {
      Logger.log('Missing action or sheetName');
      return createResponse({ error: 'Missing action or sheetName' });
    }

    const sheet = getSheet(sheetName);
    Logger.log('Sheet retrieved: ' + sheetName);

    // 액션별 처리
    if (action === 'add') {
      Logger.log('Handling add action');
      return handleAdd(sheet, requestData.data);
    } else if (action === 'update') {
      return handleUpdate(sheet, requestData.rowIndex, requestData.data);
    } else if (action === 'delete') {
      return handleDelete(sheet, requestData.rowIndex);
    } else {
      return createResponse({ error: 'Invalid action: ' + action });
    }

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
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
    Logger.log('handleAdd called with data: ' + JSON.stringify(data));

    // ID 자동 생성
    const lastRow = sheet.getLastRow();
    Logger.log('Last row: ' + lastRow);
    let newId = 1;

    if (lastRow > 1) {
      const idRange = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      const ids = idRange.map(row => parseInt(row[0]) || 0);
      newId = Math.max(...ids, 0) + 1;
    }

    Logger.log('New ID: ' + newId);

    // 데이터 배열 준비
    let rowData;
    if (Array.isArray(data)) {
      rowData = [...data];
      // ID가 없거나 빈 값이면 자동 생성된 ID로 교체
      if (!rowData[0] || rowData[0] === '') {
        rowData[0] = newId;
      }
    } else {
      Logger.log('Data is not an array: ' + typeof data);
      return createResponse({ error: 'Data must be an array' });
    }

    Logger.log('Row data to append: ' + JSON.stringify(rowData));

    // 행 추가
    sheet.appendRow(rowData);

    Logger.log('Row appended successfully');

    // 알림 전송 (비동기로 실행하여 응답 지연 방지)
    try {
      sendNotification(rowData);
    } catch (notificationError) {
      Logger.log('Notification error (non-blocking): ' + notificationError.toString());
    }

    return createResponse({ success: true, id: newId });
  } catch (error) {
    Logger.log('Error in handleAdd: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
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

// ============================================
// 알림 전송 함수
// ============================================

// 알림 전송 (이메일 + Telegram)
function sendNotification(rowData) {
  // rowData: [ID, 이름, 이메일, 전화번호, 서비스, 메시지, 읽음, 생성일시]
  if (!rowData || rowData.length < 8) {
    Logger.log('Invalid rowData for notification');
    return;
  }

  const id = rowData[0];
  const name = rowData[1] || '이름 없음';
  const email = rowData[2] || '이메일 없음';
  const phone = rowData[3] || '전화번호 없음';
  const service = rowData[4] || '서비스 없음';
  const message = rowData[5] || '메시지 없음';
  const createdAt = rowData[7] || new Date().toISOString();

  // 서비스 이름 변환
  const serviceNames = {
    'responsive': '반응형 웹사이트',
    'shopping': '쇼핑몰 구축',
    'corporate': '기업 홈페이지',
    'booking': '예약 시스템',
    'maintenance': '유지보수',
    'custom': '맞춤 개발'
  };
  const serviceName = serviceNames[service] || service;

  // 날짜 포맷팅
  const date = new Date(createdAt);
  const formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

  // 이메일 알림
  if (ENABLE_EMAIL_NOTIFICATION && NOTIFICATION_EMAIL) {
    try {
      const subject = '🔔 새로운 상담 신청이 접수되었습니다';
      const body = `
새로운 상담 신청이 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 상담 신청 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🆔 신청 번호: ${id}
👤 이름: ${name}
📧 이메일: ${email}
📞 전화번호: ${phone}
💼 서비스: ${serviceName}
💬 메시지: ${message}
📅 접수 시간: ${formattedDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Google Sheets에서 확인하기:
https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=0
      `.trim();

      MailApp.sendEmail({
        to: NOTIFICATION_EMAIL,
        subject: subject,
        body: body
      });

      Logger.log('Email notification sent to: ' + NOTIFICATION_EMAIL);
    } catch (emailError) {
      Logger.log('Email notification error: ' + emailError.toString());
    }
  }

  // IFTTT Webhook 알림
  if (ENABLE_IFTTT_NOTIFICATION && IFTTT_WEBHOOK_KEY && IFTTT_EVENT_NAME) {
    try {
      const iftttUrl = `https://maker.ifttt.com/trigger/${IFTTT_EVENT_NAME}/with/key/${IFTTT_WEBHOOK_KEY}`;

      // IFTTT Webhook은 최대 3개의 value를 전송할 수 있음
      // value1, value2, value3로 데이터 전송
      const payload = {
        'value1': `새로운 상담 신청 #${id}`,
        'value2': `${name} (${phone})`,
        'value3': `${serviceName} - ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`
      };

      const options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(payload)
      };

      UrlFetchApp.fetch(iftttUrl, options);

      Logger.log('IFTTT notification sent');
    } catch (iftttError) {
      Logger.log('IFTTT notification error: ' + iftttError.toString());
    }
  }
}
