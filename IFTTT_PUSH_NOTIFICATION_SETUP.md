# IFTTT 푸시 알림 설정 가이드

Google Apps Script와 IFTTT를 연동하여 휴대폰 푸시 알림을 받는 방법입니다.

## 📱 IFTTT란?

IFTTT (If This Then That)는 다양한 서비스를 연결하는 자동화 플랫폼입니다.
- 무료 플랜 제공
- 간단한 설정
- 다양한 알림 채널 지원 (앱 푸시, 이메일, SMS 등)

## 🚀 설정 방법

### 1단계: IFTTT 계정 생성

1. **IFTTT 웹사이트 접속**
   - https://ifttt.com 접속
   - "Get started" 또는 "Sign up" 클릭
   - Google 계정 또는 이메일로 가입

2. **로그인**
   - 가입 완료 후 로그인

### 2단계: Webhook 앱 생성

1. **새 Applet 생성**
   - 상단 메뉴에서 "Create" 클릭
   - 또는 https://ifttt.com/create 접속

2. **"If This" 설정**
   - "If This" 클릭
   - 검색창에 "Webhooks" 입력
   - "Webhooks" 선택
   - "Receive a web request" 선택

3. **Event Name 설정**
   - Event Name 입력: `new_consultation` (또는 원하는 이름)
   - "Create trigger" 클릭

4. **"Then That" 설정**
   - "Then That" 클릭
   - 원하는 알림 방법 선택:

   **옵션 A: 푸시 알림 (추천)**
   - "Notifications" 검색 및 선택
   - "Send a notification from the IFTTT app" 선택
   - 메시지 템플릿 설정:
     ```
     {{Value1}}
     {{Value2}}
     {{Value3}}
     ```
   - "Create action" 클릭

   **옵션 B: 이메일**
   - "Email" 검색 및 선택
   - "Send me an email" 선택
   - 제목과 본문에 `{{Value1}}`, `{{Value2}}`, `{{Value3}}` 사용
   - "Create action" 클릭

   **옵션 C: SMS (유료)**
   - "SMS" 검색 및 선택
   - "Send me an SMS" 선택
   - 메시지에 `{{Value1}}`, `{{Value2}}`, `{{Value3}}` 사용
   - "Create action" 클릭

5. **Applet 완성**
   - "Finish" 클릭

### 3단계: Webhook 키 확인

1. **Webhooks 서비스 페이지 접속**
   - https://ifttt.com/maker_webhooks 접속
   - 또는 상단 메뉴에서 "Services" > "Webhooks" 클릭

2. **키 복사**
   - "Your key is:" 아래의 긴 문자열 복사
   - 예: `abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567yz`
   - 이 키를 안전하게 보관하세요

### 4단계: Google Apps Script 코드 설정

1. **`google-apps-script-code.js` 파일 열기**

2. **다음 변수 수정:**
   ```javascript
   const IFTTT_WEBHOOK_KEY = '여기에_복사한_키_붙여넣기';
   const IFTTT_EVENT_NAME = 'new_consultation'; // 위에서 설정한 Event name과 동일하게
   const ENABLE_IFTTT_NOTIFICATION = true; // false를 true로 변경
   ```

3. **코드 배포**
   - Apps Script 편집기에 코드 붙여넣기
   - 저장
   - `배포` > `배포 관리` > 기존 배포 편집
   - `새 버전` 체크하지 않고 배포

### 5단계: IFTTT 앱 설치 (푸시 알림 사용 시)

1. **스마트폰에 IFTTT 앱 설치**
   - iOS: App Store에서 "IFTTT" 검색
   - Android: Google Play Store에서 "IFTTT" 검색

2. **앱에서 로그인**
   - IFTTT 계정으로 로그인

3. **알림 권한 허용**
   - 앱에서 알림 권한 요청 시 허용

## 📋 전송되는 데이터

IFTTT Webhook은 최대 3개의 값(value1, value2, value3)을 전송할 수 있습니다.

현재 설정:
- **value1**: `새로운 상담 신청 #ID`
- **value2**: `이름 (전화번호)`
- **value3**: `서비스 - 메시지 (최대 100자)`

## 🎨 알림 메시지 커스터마이징

### 푸시 알림 메시지 예시

IFTTT 앱의 "Send a notification" 액션에서 다음과 같이 설정할 수 있습니다:

```
🔔 {{Value1}}

{{Value2}}
{{Value3}}

Google Sheets에서 확인하기
```

### 이메일 알림 예시

제목:
```
{{Value1}}
```

본문:
```
새로운 상담 신청이 접수되었습니다.

{{Value2}}
{{Value3}}
```

## 🔧 고급 설정: 더 많은 정보 전송

IFTTT Webhook은 3개의 값만 전송할 수 있지만, JSON 형식으로 더 많은 정보를 전송할 수 있습니다.

### Google Apps Script 코드 수정 (선택사항)

더 자세한 정보를 전송하려면 `sendNotification` 함수를 수정:

```javascript
// IFTTT Webhook 알림 (고급)
if (ENABLE_IFTTT_NOTIFICATION && IFTTT_WEBHOOK_KEY && IFTTT_EVENT_NAME) {
  try {
    const iftttUrl = `https://maker.ifttt.com/trigger/${IFTTT_EVENT_NAME}/with/key/${IFTTT_WEBHOOK_KEY}`;
    
    // JSON 형식으로 모든 정보 전송
    const fullData = {
      id: id,
      name: name,
      email: email,
      phone: phone,
      service: serviceName,
      message: message,
      createdAt: formattedDate
    };
    
    const payload = {
      'value1': `새로운 상담 신청 #${id}`,
      'value2': JSON.stringify(fullData), // JSON 문자열로 전송
      'value3': `${name} - ${serviceName}`
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
```

## ✅ 테스트 방법

### 1. Webhook 테스트

1. **IFTTT Webhooks 페이지 접속**
   - https://ifttt.com/maker_webhooks 접속
   - "Test" 섹션에서 Event name 입력: `new_consultation`
   - "Test it" 클릭

2. **알림 확인**
   - 휴대폰에서 알림 확인
   - 또는 이메일 확인

### 2. 실제 상담 폼 테스트

1. 웹사이트에서 상담 폼 제출
2. 휴대폰에서 알림 확인
3. Apps Script 실행 로그에서 "IFTTT notification sent" 확인

## 🐛 문제 해결

### 알림이 오지 않는 경우

1. **IFTTT 앱 확인**
   - 앱이 설치되어 있고 로그인되어 있는지 확인
   - 알림 권한이 허용되어 있는지 확인

2. **Applet 활성화 확인**
   - IFTTT 웹사이트에서 "My Applets" 확인
   - Applet이 활성화되어 있는지 확인 (토글이 켜져 있어야 함)

3. **Webhook 키 확인**
   - 키가 올바르게 입력되었는지 확인
   - 공백이나 특수문자가 없는지 확인

4. **Event Name 확인**
   - Google Apps Script의 `IFTTT_EVENT_NAME`과 IFTTT의 Event name이 일치하는지 확인

5. **Apps Script 실행 로그 확인**
   - "IFTTT notification sent" 로그 확인
   - 오류 메시지 확인

### Webhook 테스트 실패

1. **키 확인**
   - Webhook 키가 올바른지 확인
   - 키에 공백이 없는지 확인

2. **Event Name 확인**
   - Event name이 정확히 일치하는지 확인 (대소문자 구분)

3. **인터넷 연결 확인**
   - Apps Script가 인터넷에 접근할 수 있는지 확인

## 💡 추가 팁

### 여러 알림 채널 동시 사용

IFTTT Applet에서 여러 "Then That" 액션을 추가할 수 있습니다:
- 푸시 알림 + 이메일
- 푸시 알림 + SMS
- 푸시 알림 + Slack
- 등등

### 조건부 알림

IFTTT의 Filter 기능을 사용하여 특정 조건에서만 알림을 받을 수 있습니다:
- 특정 서비스 유형일 때만
- 특정 키워드가 포함된 메시지일 때만

### 알림 비활성화

일시적으로 알림을 끄려면:
```javascript
const ENABLE_IFTTT_NOTIFICATION = false;
```

또는 IFTTT 웹사이트에서 Applet을 비활성화할 수 있습니다.

## 📝 체크리스트

- [ ] IFTTT 계정 생성 완료
- [ ] Webhook Applet 생성 완료
- [ ] Event name 설정 완료
- [ ] 알림 방법 선택 완료 (푸시/이메일/SMS)
- [ ] Webhook 키 복사 완료
- [ ] Google Apps Script 코드에 키 입력 완료
- [ ] `ENABLE_IFTTT_NOTIFICATION = true` 설정 완료
- [ ] 코드 배포 완료
- [ ] IFTTT 앱 설치 및 로그인 완료 (푸시 알림 사용 시)
- [ ] 테스트 완료

## 🎯 예상 결과

설정 완료 후:
- 새로운 상담 신청이 들어오면 즉시 휴대폰으로 푸시 알림 수신
- 알림 내용: 신청 번호, 이름, 전화번호, 서비스, 메시지 요약
- 알림 클릭 시 Google Sheets로 바로 이동 가능 (설정 시)

