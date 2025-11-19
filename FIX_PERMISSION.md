# Google Sheets 데이터 저장 문제 해결

## 🔴 문제: GET 요청으로 리다이렉트되고 데이터가 저장되지 않음

현재 상황:
- POST 요청이 GET으로 변환됨
- `script.googleusercontent.com/macros/echo`로 리다이렉트됨
- 데이터가 Google Sheets에 저장되지 않음

## ✅ 해결 방법: 권한 사전 승인

Google Apps Script Web App은 **첫 접근 시 권한 확인을 위해 리다이렉트**를 합니다.
이 과정에서 POST 요청이 GET으로 변환되어 데이터가 손실됩니다.

### 단계별 해결

#### 1단계: Web App URL에 직접 접근하여 권한 승인

브라우저에서 다음 URL을 직접 열어주세요:

```
https://script.google.com/macros/s/AKfycby5P8BOtp0yCNfkYPm0bfh-WTbtE1d0_dn1juclhbf1g0tKLzkYQGp5OeFgI1370gIPww/exec?action=read&sheetName=Contacts
```

**예상되는 동작:**
1. Google 로그인 페이지가 나타날 수 있음
2. "권한 확인" 또는 "승인 필요" 메시지가 나타남
3. **"고급"** 클릭
4. **"안전하지 않은 페이지로 이동"** 클릭
5. **"허용"** 클릭

**성공 확인:**
- 브라우저에 JSON 데이터 또는 `{"error":"..."}` 메시지가 표시되면 성공
- 이제 POST 요청이 정상적으로 작동합니다

#### 2단계: 상담 폼 테스트

1. 웹사이트로 돌아가기
2. 상담 폼 작성 및 제출
3. 브라우저 콘솔(F12) 확인:
   - "Sending data to Google Sheets" 로그 확인
   - "Response status: 200" 확인
   - "Response data: {success: true}" 확인

4. Google Sheets 확인:
   - https://docs.google.com/spreadsheets/d/1Ti5VbosoCFzi-4OhP4HDMe0p8JPAjVQmZlr9LiZkaOI/edit
   - `Contacts` 시트에서 데이터 확인

## 🔍 추가 확인 사항

### Google Apps Script 실행 로그 확인

1. **Apps Script 편집기 열기**
   - 스프레드시트에서 `확장 프로그램` > `Apps Script` 클릭

2. **실행 로그 확인**
   - `보기` > `실행 로그` 클릭
   - 또는 왼쪽 메뉴에서 `실행 로그` 클릭

3. **확인할 내용**
   - "POST received" 로그가 있는지
   - "handleAdd called" 로그가 있는지
   - "Row appended successfully" 로그가 있는지
   - 오류 메시지가 있는지

### 브라우저 콘솔 확인

1. **개발자 도구 열기** (F12)
2. **Console 탭**
   - 모든 로그 메시지 확인
   - 오류 메시지 확인

3. **Network 탭**
   - POST 요청이 실제로 전송되었는지 확인
   - 응답 상태 코드 확인 (200 OK)
   - 응답 본문 확인

## ⚠️ 중요 참고사항

### 권한 승인은 한 번만 하면 됩니다
- 한 번 승인하면 이후 요청은 정상적으로 작동합니다
- 다른 브라우저나 시크릿 모드에서는 다시 승인해야 할 수 있습니다

### 권한 승인 후에도 작동하지 않는 경우

1. **브라우저 캐시 클리어**
   - Ctrl+Shift+R (강력 새로고침)

2. **Google Apps Script 재배포**
   - `배포` > `배포 관리` > 기존 배포 편집
   - `새 버전` 체크하지 않고 배포

3. **코드 확인**
   - `google-apps-script-code.js`가 Apps Script에 정확히 복사되었는지 확인
   - 저장되었는지 확인

## 📝 체크리스트

- [ ] Web App URL에 직접 접근하여 권한 승인 완료
- [ ] 브라우저에 JSON 응답이 표시됨
- [ ] 상담 폼 제출 테스트
- [ ] 브라우저 콘솔에서 "Response status: 200" 확인
- [ ] Google Sheets에서 데이터 확인
- [ ] Apps Script 실행 로그에서 "POST received" 확인

## 🎯 예상 결과

권한 승인 후:
- POST 요청이 정상적으로 전송됨
- 응답 상태: 200 OK
- 응답 본문: `{"success": true, "id": 1}`
- Google Sheets에 데이터가 저장됨

