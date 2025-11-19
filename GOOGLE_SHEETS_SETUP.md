# Google Sheets 연동 설정 가이드

이 프로젝트는 **문의하기(상담 신청)** 기능만 Google Sheets를 사용하며, **포트폴리오 관리**는 기존 Supabase를 사용합니다.

## 📋 목차

1. [Google Sheets 준비](#1-google-sheets-준비)
2. [Google Apps Script 설정](#2-google-apps-script-설정)
3. [웹 앱 배포](#3-웹-앱-배포)
4. [프로젝트 설정](#4-프로젝트-설정)
5. [시트 구조](#5-시트-구조)

## ⚠️ 중요 사항

- **포트폴리오 관리**: Supabase 사용 (기존 방식 유지)
- **문의하기(상담 신청)**: Google Sheets 사용

## 1. Google Sheets 준비

### 1.1 Google Sheets 링크

스프레드시트 ID: `1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI`

### 1.2 시트 생성

스프레드시트에 **Contacts** 시트를 생성합니다:

#### Contacts 시트
첫 번째 행에 다음 헤더를 입력합니다:

| ID | 이름 | 이메일 | 전화번호 | 서비스 | 메시지 | 읽음 | 생성일시 |
|---|---|---|---|---|---|---|---|
| 1 | 홍길동 | test@example.com | 010-1234-5678 | responsive | 문의 내용... | FALSE | 2024-01-01T00:00:00.000Z |

## 2. Google Apps Script 설정

### 2.1 Apps Script 프로젝트 생성

1. Google Sheets에서 **확장 프로그램** > **Apps Script** 클릭
2. 새 프로젝트가 열립니다

### 2.2 스크립트 작성

기본 코드를 삭제하고 `google-apps-script-code.js` 파일의 코드를 붙여넣습니다.

또는 다음 코드를 사용하세요:

```javascript
// Google Sheets ID
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
        const lastId = sheet.getRange(lastRow, 1).getValue();
        newId = (lastId || 0) + 1;
      }
      
      // 데이터 배열에 ID 추가
      const rowData = [newId, ...data.data];
      
      // 행 추가
      sheet.appendRow(rowData);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, id: newId }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (action === 'update') {
      const rowIndex = data.rowIndex;
      const rowData = data.data;
      
      // 행 업데이트
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (action === 'delete') {
      const rowIndex = data.rowIndex;
      
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

### 2.3 스프레드시트 ID 확인

스프레드시트 ID는 이미 설정되어 있습니다: `1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI`

만약 다른 스프레드시트를 사용하려면:
1. Google Sheets의 URL에서 스프레드시트 ID를 복사합니다
   - URL 형식: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
2. 스크립트의 `SPREADSHEET_ID` 변수에 붙여넣습니다

## 3. 웹 앱 배포

### 3.1 배포 설정

1. Apps Script 편집기에서 **배포** > **새 배포** 클릭
2. **유형 선택**에서 **웹 앱** 선택
3. 다음 설정 입력:
   - **설명**: "BrandiUp Google Sheets API"
   - **실행 대상**: "나"
   - **액세스 권한**: "모든 사용자" 선택
4. **배포** 클릭
5. 권한 승인:
   - **권한 확인** 클릭
   - Google 계정 선택
   - **고급** > **안전하지 않은 페이지로 이동** 클릭
   - **허용** 클릭
6. **웹 앱 URL** 복사 (예: `https://script.google.com/macros/s/...`)

## 4. 프로젝트 설정

### 4.1 Google Script URL 설정

**js/google-sheets-api.js** 파일을 열고 `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL`을 배포한 웹 앱 URL로 변경합니다:

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

### 4.2 시트 이름 확인

다음 파일에서 시트 이름이 올바른지 확인합니다:

- **admin.html**: `const CONTACTS_SHEET_NAME = 'Contacts';`
- **js/main.js**: `addToSheet('Contacts', ...)`

시트 이름이 다르면 Google Sheets의 시트 이름과 일치하도록 수정하세요.

**참고**: 포트폴리오는 Supabase를 사용하므로 Google Sheets 설정이 필요하지 않습니다.

## 5. 시트 구조

### 5.1 Contacts 시트 (문의하기)

| 열 | 이름 | 설명 | 예시 |
|---|---|---|---|
| A | ID | 고유 식별자 | 1 |
| B | 이름 | 신청자 이름 | "홍길동" |
| C | 이메일 | 이메일 주소 | "test@example.com" |
| D | 전화번호 | 전화번호 | "010-1234-5678" |
| E | 서비스 | 신청 서비스 | "responsive" |
| F | 메시지 | 문의 내용 | "웹사이트 제작 문의..." |
| G | 읽음 | 읽음 여부 (TRUE/FALSE) | FALSE |
| H | 생성일시 | 생성 날짜/시간 (ISO 형식) | "2024-01-01T00:00:00.000Z" |

## 🔧 문제 해결

### CORS 오류 발생 시

Google Apps Script의 웹 앱 배포에서 **액세스 권한**을 "모든 사용자"로 설정했는지 확인하세요.

### 데이터가 저장되지 않을 때

1. Apps Script의 권한이 올바르게 설정되었는지 확인
2. 스프레드시트 ID가 올바른지 확인
3. 시트 이름이 정확히 일치하는지 확인 (대소문자 구분)

### 시트가 자동으로 생성되지 않을 때

Apps Script 코드에서 시트 생성 부분이 올바르게 작동하는지 확인하고, 필요시 수동으로 시트를 생성하세요.

## 📝 참고사항

- Google Sheets는 무료로 사용할 수 있지만, 일일 읽기/쓰기 제한이 있습니다 (약 6분당 100회)
- 대량의 데이터를 다룰 때는 성능이 저하될 수 있습니다
- 중요한 데이터는 정기적으로 백업하세요

## 🎉 완료!

이제 프로젝트가 Google Sheets를 사용하여 데이터를 저장하고 관리합니다!

