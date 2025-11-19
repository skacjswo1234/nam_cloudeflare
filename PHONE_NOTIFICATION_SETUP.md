# 휴대폰 알림 설정 가이드

Google Sheets에 새로운 상담 신청이 들어올 때 휴대폰으로 알림을 받는 방법입니다.

## 📧 방법 1: 이메일 알림 (가장 간단)

### 설정 방법

1. **Google Apps Script 코드 수정**
   - `google-apps-script-code.js` 파일 열기
   - 상단의 `NOTIFICATION_EMAIL` 변수에 이메일 주소 입력:
     ```javascript
     const NOTIFICATION_EMAIL = 'your-email@example.com';
     ```
   - 여러 주소일 경우 쉼표로 구분:
     ```javascript
     const NOTIFICATION_EMAIL = 'email1@example.com, email2@example.com';
     ```

2. **코드 배포**
   - Apps Script 편집기에 코드 붙여넣기
   - 저장
   - `배포` > `배포 관리` > 기존 배포 편집
   - `새 버전` 체크하지 않고 배포

3. **휴대폰 이메일 앱 설정**
   - 스마트폰 이메일 앱에 해당 계정 추가
   - 알림 설정 활성화
   - 새 이메일이 오면 푸시 알림 받음

### 장점
- ✅ 설정이 매우 간단함
- ✅ 추가 앱 설치 불필요
- ✅ 여러 사람에게 동시 전송 가능

---

## 📱 방법 2: Telegram 봇 알림 (추천)

Telegram은 실시간 푸시 알림이 가능하고 무료입니다.

### 설정 방법

#### 1단계: Telegram 봇 생성

1. **Telegram 앱 열기** (스마트폰 또는 웹)
2. **@BotFather 검색 및 대화 시작**
3. **봇 생성 명령 입력:**
   ```
   /newbot
   ```
4. **봇 이름 입력** (예: "상담 신청 알림 봇")
5. **봇 사용자 이름 입력** (예: "my_consultation_bot")
6. **봇 토큰 복사** (예: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### 2단계: Chat ID 확인

1. **생성한 봇에게 메시지 보내기**
   - Telegram에서 방금 만든 봇 검색
   - 아무 메시지나 보내기 (예: "안녕")

2. **Chat ID 확인**
   - 브라우저에서 다음 URL 열기 (TOKEN을 위에서 받은 토큰으로 교체):
     ```
     https://api.telegram.org/bot{TOKEN}/getUpdates
     ```
   - 예: `https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/getUpdates`
   - JSON 응답에서 `"chat":{"id":123456789}` 부분의 숫자가 Chat ID입니다
   - `새 버전` 체크하지 않고 배포

#### 4단계: 테스트

1. 상담 폼 제출
2. Telegram에서 봇으로부터 알림 확인

### 장점
- ✅ 실시간 푸시 알림
- ✅ 무료
- ✅ 메시지 형식이 깔끔함
- ✅ 여러 기기에서 동시 수신 가능

---

## 🔔 방법 3: Line Notify (한국에서 많이 사용)

Line Notify를 사용하여 Line 앱으로 알림을 받을 수 있습니다.

### 설정 방법

1. **Line Notify 웹사이트 접속**
   - https://notify-bot.line.me/ 접속
   - 로그인

2. **토큰 발급**
   - "토큰 발급" 클릭
   - 토큰 이름 입력 (예: "상담 신청 알림")
   - 알림을 받을 대화방 선택
   - 토큰 복사

3. **Google Apps Script 코드 수정**
   - `sendNotification` 함수에 Line Notify 코드 추가:
     ```javascript
     // Line Notify 알림
     if (ENABLE_LINE_NOTIFICATION && LINE_NOTIFY_TOKEN) {
       try {
         const lineUrl = 'https://notify-api.line.me/api/notify';
         const lineMessage = `🔔 새로운 상담 신청\n\n이름: ${name}\n이메일: ${email}\n전화번호: ${phone}\n서비스: ${serviceName}`;
         
         const options = {
           'method': 'post',
           'headers': {
             'Authorization': 'Bearer ' + LINE_NOTIFY_TOKEN
           },
           'payload': {
             'message': lineMessage
           }
         };
         
         UrlFetchApp.fetch(lineUrl, options);
       } catch (lineError) {
         Logger.log('Line notification error: ' + lineError.toString());
       }
     }
     ```

---

## 📋 알림 내용

알림에는 다음 정보가 포함됩니다:
- 신청 번호 (ID)
- 이름
- 이메일
- 전화번호
- 서비스 유형
- 메시지 내용
- 접수 시간
- Google Sheets 링크 (이메일만)

---

## ⚙️ 알림 설정 변경

### 이메일 알림 끄기
```javascript
const ENABLE_EMAIL_NOTIFICATION = false;
```

### Telegram 알림 끄기
```javascript
const ENABLE_TELEGRAM_NOTIFICATION = false;
```

### 여러 이메일 주소로 전송
```javascript
const NOTIFICATION_EMAIL = 'email1@example.com, email2@example.com, email3@example.com';
```

---

## 🐛 문제 해결

### 이메일이 오지 않는 경우
1. 스팸 폴더 확인
2. Gmail 계정 권한 확인
3. Apps Script 실행 로그 확인

### Telegram 알림이 오지 않는 경우
1. 봇 토큰이 올바른지 확인
2. Chat ID가 올바른지 확인
3. 봇에게 메시지를 보냈는지 확인
4. Apps Script 실행 로그 확인

---

## 💡 추천 설정

**가장 간단한 방법:** 이메일 알림만 사용
- 설정이 가장 쉬움
- 스마트폰 이메일 앱 알림 활성화

**가장 실용적인 방법:** Telegram 봇 사용
- 실시간 알림
- 메시지 형식이 깔끔함
- 무료

**가장 확실한 방법:** 이메일 + Telegram 동시 사용
- 이중 알림으로 놓치지 않음

