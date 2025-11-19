# 상담 신청 폼 - Google Sheets 연동 가이드

## 📋 Google Sheets 구조

### 시트 이름: `Contacts`

#### 컬럼 구조 (8개 컬럼)

| 컬럼 | 이름 | 설명 | 데이터 타입 |
|------|------|------|------------|
| A | ID | 고유 식별자 (자동 생성) | 숫자 |
| B | 이름 | 고객 이름 | 텍스트 |
| C | 이메일 | 고객 이메일 주소 | 텍스트 |
| D | 전화번호 | 고객 전화번호 | 텍스트 |
| E | 서비스 | 선택한 서비스 유형 | 텍스트 |
| F | 메시지 | 상담 요청 메시지 | 텍스트 |
| G | 읽음 | 읽음 여부 (TRUE/FALSE) | 논리값 |
| H | 생성일시 | 제출 일시 (ISO 형식) | 날짜/시간 |

#### 헤더 행 (1행)
```
ID | 이름 | 이메일 | 전화번호 | 서비스 | 메시지 | 읽음 | 생성일시
```

#### 데이터 예시
```
1 | 홍길동 | hong@example.com | 010-1234-5678 | responsive | 반응형 웹사이트 제작 문의 | FALSE | 2024-01-15T10:30:00.000Z
```

---

## 🔧 Google Apps Script 코드

### 전체 코드

```javascript
// Google Sheets ID
// Google Sheets URL: https://docs.google.com/spreadsheets/d/1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI/edit
const SPREADSHEET_ID = '1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI';

// 스프레드시트 가져오기
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// 시트 가져오기 (없으면 생성)
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  // 시트가 없으면 생성
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // 헤더 설정 (Contacts 시트만)
    if (sheetName === 'Contacts') {
      sheet.getRange(1, 1, 1, 8).setValues([[
        'ID', '이름', '이메일', '전화번호', '서비스', '메시지', '읽음', '생성일시'
      ]]);
      
      // 헤더 스타일 설정
      const headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f0f0f0');
      headerRange.setFontSize(11);
      
      // 컬럼 너비 자동 조정
      sheet.setColumnWidth(1, 60);  // ID
      sheet.setColumnWidth(2, 100); // 이름
      sheet.setColumnWidth(3, 200); // 이메일
      sheet.setColumnWidth(4, 120); // 전화번호
      sheet.setColumnWidth(5, 150); // 서비스
      sheet.setColumnWidth(6, 300); // 메시지
      sheet.setColumnWidth(7, 80);  // 읽음
      sheet.setColumnWidth(8, 180); // 생성일시
    }
  }
  
  return sheet;
}

// GET 요청 처리 (데이터 읽기)
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

// POST 요청 처리 (데이터 추가/수정/삭제)
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
      
      // 데이터 배열에 ID 추가
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
```

---

## 📝 설정 방법

### 1. Google Sheets 생성
1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 시트 이름을 `Contacts`로 변경
4. URL에서 Spreadsheet ID 복사 (예: `1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI`)

### 2. Google Apps Script 설정
1. 스프레드시트에서 `확장 프로그램` > `Apps Script` 클릭
2. 위의 전체 코드를 복사하여 붙여넣기
3. `SPREADSHEET_ID`를 자신의 스프레드시트 ID로 변경
4. 저장 (Ctrl+S)
5. `배포` > `새 배포` 클릭
6. 유형: `웹 앱` 선택
7. 설정:
   - 설명: "상담 신청 폼 API"
   - 실행 대상: `나`
   - 액세스 권한: `모든 사용자` 선택
8. `배포` 클릭
9. **Web App URL 복사** (예: `https://script.google.com/macros/s/AKfycbx.../exec`)

### 3. 프론트엔드 설정
1. `js/google-sheets-api.js` 파일 열기
2. `GOOGLE_SCRIPT_URL`을 위에서 복사한 Web App URL로 변경

```javascript
const GOOGLE_SCRIPT_URL = '여기에_Web_App_URL_붙여넣기';
```

---

## 📊 데이터 형식

### 상담 신청 데이터 구조

```javascript
{
  id: 1,                              // 자동 생성
  name: "홍길동",                      // 필수
  email: "hong@example.com",          // 필수
  phone: "010-1234-5678",             // 필수
  service: "responsive",               // 필수 (선택 옵션)
  message: "반응형 웹사이트 제작 문의",  // 필수
  isRead: false,                       // 기본값: false
  createdAt: "2024-01-15T10:30:00.000Z" // 자동 생성
}
```

### 서비스 옵션 값
- `responsive` - 반응형 웹사이트
- `shopping` - 쇼핑몰 구축
- `corporate` - 기업 홈페이지
- `booking` - 예약 시스템
- `maintenance` - 유지보수
- `custom` - 맞춤 개발

---

## 🔍 API 엔드포인트

### 1. 데이터 추가 (POST)
```javascript
POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
Content-Type: application/json

{
  "action": "add",
  "sheetName": "Contacts",
  "data": ["", "홍길동", "hong@example.com", "010-1234-5678", "responsive", "문의 내용", "FALSE", "2024-01-15T10:30:00.000Z"]
}
```

### 2. 데이터 읽기 (GET)
```javascript
GET https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=read&sheetName=Contacts
```

### 3. 데이터 업데이트 (POST)
```javascript
POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
Content-Type: application/json

{
  "action": "update",
  "sheetName": "Contacts",
  "rowIndex": 2,
  "data": [1, "홍길동", "hong@example.com", "010-1234-5678", "responsive", "문의 내용", "TRUE", "2024-01-15T10:30:00.000Z"]
}
```

### 4. 데이터 삭제 (POST)
```javascript
POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
Content-Type: application/json

{
  "action": "delete",
  "sheetName": "Contacts",
  "rowIndex": 2
}
```

---

## ✅ 확인 사항

- [ ] Google Sheets에 `Contacts` 시트가 생성되었는지 확인
- [ ] 헤더 행이 올바르게 설정되었는지 확인
- [ ] Google Apps Script가 배포되었는지 확인
- [ ] Web App URL이 `js/google-sheets-api.js`에 설정되었는지 확인
- [ ] 액세스 권한이 "모든 사용자"로 설정되었는지 확인

---

## 🐛 문제 해결

### 데이터가 저장되지 않는 경우
1. Google Apps Script의 실행 로그 확인
2. Web App URL이 올바른지 확인
3. CORS 설정 확인 (mode: 'cors' 사용)

### 권한 오류가 발생하는 경우
1. Apps Script 배포 시 액세스 권한을 "모든 사용자"로 설정
2. 스크립트를 다시 배포

### 시트가 생성되지 않는 경우
1. Apps Script 코드에서 `getSheet` 함수 확인
2. 스프레드시트 ID가 올바른지 확인

