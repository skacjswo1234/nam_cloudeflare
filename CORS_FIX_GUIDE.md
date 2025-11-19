
# CORS 오류 해결 가이드

## 문제
Google Apps Script Web App에 요청 시 CORS 오류 발생:
```
Access to fetch at 'https://script.google.com/...' from origin 'https://brandiup.it.kr' 
has been blocked by CORS policy
```

## 해결 방법

### 1. Google Apps Script 재배포 (가장 중요!)

1. **Google Apps Script 편집기 열기**
   - 스프레드시트에서 `확장 프로그램` > `Apps Script` 클릭
   - 또는 [script.google.com](https://script.google.com) 접속

2. **코드 업데이트**
   - `google-apps-script-code.js` 파일의 최신 코드를 복사하여 붙여넣기
   - 저장 (Ctrl+S)

3. **새 버전으로 배포**
   - `배포` > `새 배포` 클릭
   - 또는 기존 배포의 `버전 관리` > `새 버전` 선택

4. **배포 설정 확인**
   - 유형: `웹 앱`
   - 설명: "상담 신청 폼 API v2" (버전 번호 추가)
   - 실행 대상: `나`
   - **액세스 권한: `모든 사용자`** ⚠️ 매우 중요!
   - `배포` 클릭

5. **Web App URL 복사**
   - 배포 후 나타나는 Web App URL을 복사
   - `js/google-sheets-api.js`의 `GOOGLE_SCRIPT_URL`에 업데이트

### 2. 프론트엔드 코드 확인

`js/google-sheets-api.js` 파일이 최신 버전인지 확인:
- form-urlencoded 형식으로 데이터 전송
- CORS 모드 사용
- 리다이렉트 처리

### 3. 브라우저 캐시 클리어

1. 개발자 도구 열기 (F12)
2. Network 탭에서 "Disable cache" 체크
3. 페이지 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)

### 4. 테스트

1. 상담 폼 작성 및 제출
2. 브라우저 콘솔에서 오류 확인
3. Google Sheets에서 데이터 확인

## 추가 문제 해결

### 여전히 CORS 오류가 발생하는 경우

1. **Google Apps Script 배포 URL 확인**
   - URL이 최신 배포 버전인지 확인
   - 이전 버전 URL을 사용하고 있을 수 있음

2. **액세스 권한 재확인**
   - 배포 설정에서 "모든 사용자"로 설정되어 있는지 확인
   - "나" 또는 "내 조직"으로 설정되어 있으면 CORS 오류 발생

3. **스크립트 권한 확인**
   - 처음 실행 시 권한 요청이 나타나면 승인
   - 스크립트가 Google Sheets에 접근할 수 있는 권한 필요

4. **대안: JSONP 사용**
   - CORS가 완전히 해결되지 않는 경우 JSONP 방식 사용 가능
   - 하지만 POST 요청에는 제한적

## 확인 체크리스트

- [ ] Google Apps Script 코드가 최신 버전으로 업데이트됨
- [ ] 스크립트가 새 버전으로 배포됨
- [ ] 액세스 권한이 "모든 사용자"로 설정됨
- [ ] Web App URL이 `js/google-sheets-api.js`에 올바르게 설정됨
- [ ] 브라우저 캐시가 클리어됨
- [ ] Google Sheets에서 데이터가 정상적으로 저장되는지 확인

## 참고

- Google Apps Script Web App은 기본적으로 CORS를 지원하지만, 
  배포 설정이 올바르지 않으면 CORS 오류가 발생할 수 있습니다.
- 가장 중요한 것은 **액세스 권한을 "모든 사용자"로 설정**하는 것입니다.

