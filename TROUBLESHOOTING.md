# Google Sheets 데이터 저장 문제 해결 가이드

## 문제: 데이터가 Google Sheets에 저장되지 않음

### 증상
- 상담 신청 완료 메시지는 표시됨
- 하지만 Google Sheets에는 데이터가 저장되지 않음
- 네트워크 탭에서 GET 요청만 보이고 POST 요청이 리다이렉트됨

### 원인
Google Apps Script Web App은 **첫 접근 시 권한 확인을 위해 리다이렉트**를 합니다.
이 과정에서 POST 요청이 GET으로 변환되거나 데이터가 손실될 수 있습니다.

## 해결 방법

### 방법 1: 권한 사전 승인 (권장)

1. **브라우저에서 Web App URL 직접 접근**
   ```
   https://script.google.com/macros/s/AKfycby5P8BOtp0yCNfkYPm0bfh-WTbtE1d0_dn1juclhbf1g0tKLzkYQGp5OeFgI1370gIPww/exec?action=read&sheetName=Contacts
   ```

2. **권한 승인**
   - "권한 확인" 또는 "승인 필요" 메시지가 나타나면
   - Google 계정 선택
   - "고급" > "안전하지 않은 페이지로 이동" 클릭
   - "허용" 클릭

3. **성공 메시지 확인**
   - `{"error":"Invalid action or missing sheetName"}` 또는 데이터가 표시되면 성공
   - 이제 POST 요청이 정상적으로 작동합니다

4. **상담 폼 테스트**
   - 웹사이트에서 상담 폼 제출
   - Google Sheets에서 데이터 확인

### 방법 2: Google Apps Script 실행 로그 확인

1. **Apps Script 편집기 열기**
   - 스프레드시트에서 `확장 프로그램` > `Apps Script` 클릭

2. **실행 로그 확인**
   - `보기` > `실행 로그` 클릭
   - 또는 `실행` > `실행 로그 보기` 클릭

3. **로그 확인**
   - POST 요청이 들어왔는지 확인
   - "POST received" 로그가 있는지 확인
   - 오류 메시지가 있는지 확인

### 방법 3: 브라우저 콘솔 확인

1. **개발자 도구 열기** (F12)
2. **Console 탭 확인**
   - "Sending data to Google Sheets" 로그 확인
   - "Form data" 로그 확인
   - 오류 메시지 확인

3. **Network 탭 확인**
   - POST 요청이 실제로 전송되었는지 확인
   - 응답 상태 코드 확인 (200 OK인지)
   - 응답 본문 확인

### 방법 4: Google Sheets 직접 확인

1. **스프레드시트 열기**
   - https://docs.google.com/spreadsheets/d/1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI/edit

2. **Contacts 시트 확인**
   - 시트가 자동으로 생성되었는지 확인
   - 헤더 행이 있는지 확인
   - 데이터가 있는지 확인

## 체크리스트

### Apps Script 설정
- [ ] 코드가 최신 버전으로 배포되었는지 확인
- [ ] 액세스 권한이 "모든 사용자"로 설정되었는지 확인
- [ ] Spreadsheet ID가 올바른지 확인: `1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI`

### 프론트엔드 설정
- [ ] `GOOGLE_SCRIPT_URL`이 올바른지 확인
- [ ] 브라우저 캐시가 클리어되었는지 확인
- [ ] 콘솔에 오류가 없는지 확인

### 권한
- [ ] Web App URL에 직접 접근하여 권한을 승인했는지 확인
- [ ] Google 계정 권한이 올바른지 확인

## 추가 디버깅

### Google Apps Script에서 직접 테스트

1. **Apps Script 편집기에서 테스트 함수 추가**
   ```javascript
   function testAdd() {
     const testData = ['', '테스트', 'test@example.com', '010-1234-5678', 'responsive', '테스트 메시지', 'FALSE', new Date().toISOString()];
     const sheet = getSheet('Contacts');
     sheet.appendRow(testData);
     Logger.log('Test data added');
   }
   ```

2. **실행**
   - 함수 선택: `testAdd`
   - 실행 버튼 클릭
   - 권한 승인
   - Google Sheets에서 데이터 확인

3. **성공하면**
   - 스크립트 자체는 정상 작동
   - 문제는 POST 요청 전송 또는 권한 승인

## 여전히 작동하지 않는 경우

1. **새 배포 생성**
   - `배포` > `새 배포` 클릭
   - 새 URL 복사
   - 프론트엔드 코드 업데이트

2. **코드 재확인**
   - `google-apps-script-code.js` 파일의 코드가 Apps Script에 정확히 복사되었는지 확인
   - 저장되었는지 확인

3. **브라우저 변경**
   - 다른 브라우저에서 테스트
   - 시크릿 모드에서 테스트

