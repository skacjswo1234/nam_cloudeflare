# Formspree 설정 가이드

## 📋 개요

Formspree는 정적 웹사이트에서 문의 폼을 처리할 수 있게 해주는 서비스입니다. 이 가이드를 따라 Formspree를 설정하고 웹사이트에 연동하세요.

## 🚀 1단계: Formspree 계정 생성

1. [Formspree.io](https://formspree.io)에 접속
2. "Get Started" 또는 "Sign Up" 클릭
3. 이메일 주소로 계정 생성
4. 이메일 인증 완료

## 📝 2단계: 새 폼 생성

1. Formspree 대시보드에서 "New Form" 클릭
2. 폼 이름 입력 (예: "WebCraft Pro 문의")
3. "Create Form" 클릭

## 🔑 3단계: 폼 ID 복사

생성된 폼의 ID를 복사합니다. URL에서 확인할 수 있습니다:
```
https://formspree.io/f/xrgjqkqr
```
여기서 `xrgjqkqr`이 폼 ID입니다.

## ⚙️ 4단계: 웹사이트에 연동

### index.html 파일 수정

`index.html` 파일에서 다음 부분을 찾아 수정합니다:

```html
<!-- 수정 전 -->
<form class="contact__form" id="contactForm" action="https://formspree.io/f/YOUR_FORMSPREE_ID" method="POST">

<!-- 수정 후 (예시) -->
<form class="contact__form" id="contactForm" action="https://formspree.io/f/xrgjqkqr" method="POST">
```

### 폼 필드 매핑

웹사이트의 폼 필드가 Formspree에서 올바르게 처리되도록 설정:

| 웹사이트 필드 | Formspree 필드 | 설명 |
|-------------|---------------|------|
| name | name | 고객 이름 |
| email | email | 고객 이메일 |
| phone | phone | 전화번호 |
| service | service | 서비스 유형 |
| message | message | 요구사항 |

## 📧 5단계: 알림 설정

### 이메일 알림 설정

1. Formspree 대시보드에서 폼 선택
2. "Settings" 탭 클릭
3. "Email Notifications" 섹션에서:
   - 알림 받을 이메일 주소 추가
   - 이메일 템플릿 커스터마이징
   - 스팸 필터 설정

### 알림 템플릿 예시

```html
새로운 문의가 접수되었습니다!

이름: {{name}}
이메일: {{email}}
전화번호: {{phone}}
서비스: {{service}}
요구사항: {{message}}

접수 시간: {{_date}}
IP 주소: {{_ip}}
```

## 🛡️ 6단계: 스팸 방지 설정

### reCAPTCHA 설정

1. Formspree 대시보드에서 폼 선택
2. "Settings" → "Spam Protection"
3. reCAPTCHA 활성화
4. 사이트 키와 시크릿 키 설정

### JavaScript에서 reCAPTCHA 비활성화

현재 설정에서는 reCAPTCHA가 비활성화되어 있습니다:

```javascript
body: JSON.stringify({
    // ... 폼 데이터
    _captcha: false
})
```

## 📊 7단계: 분석 및 모니터링

### 폼 제출 통계 확인

1. Formspree 대시보드에서 폼 선택
2. "Submissions" 탭에서 제출 내역 확인
3. 필터링 및 검색 기능 활용

### 웹훅 설정 (선택사항)

외부 서비스와 연동하려면:

1. "Settings" → "Webhooks"
2. 웹훅 URL 설정
3. 이벤트 타입 선택 (form_submission)

## 🔧 8단계: 고급 설정

### 조건부 알림

특정 조건에서만 알림을 받으려면:

1. "Settings" → "Email Notifications"
2. "Conditions" 섹션에서 조건 설정
3. 예: 특정 서비스 선택 시에만 알림

### 자동 응답 설정

고객에게 자동 응답 이메일을 보내려면:

1. "Settings" → "Auto-responders"
2. 응답 템플릿 작성
3. 발송 조건 설정

## 🧪 9단계: 테스트

### 폼 테스트

1. 웹사이트에서 문의 폼 작성
2. 제출 후 Formspree 대시보드에서 확인
3. 이메일 알림 수신 확인

### 오류 처리 확인

JavaScript에서 오류 처리가 올바르게 작동하는지 확인:

```javascript
.catch(error => {
    console.error('Error:', error);
    showErrorMessage('상담 신청에 실패했습니다. 잠시 후 다시 시도해주세요.');
})
```

## 📱 10단계: 모바일 최적화

### 모바일 테스트

1. 다양한 모바일 기기에서 폼 테스트
2. 터치 인터페이스 확인
3. 반응형 디자인 검증

## 🔍 문제 해결

### 일반적인 문제들

#### 폼이 제출되지 않음
- Formspree ID가 올바른지 확인
- 네트워크 연결 상태 확인
- 브라우저 콘솔에서 오류 메시지 확인

#### 이메일 알림을 받지 못함
- 스팸 폴더 확인
- Formspree 설정에서 이메일 주소 확인
- 알림 설정이 활성화되어 있는지 확인

#### 스팸 제출이 많음
- reCAPTCHA 활성화
- 스팸 필터 설정 조정
- IP 차단 설정

### 지원

문제가 지속되면:
- Formspree 지원팀에 문의
- 웹사이트 개발자에게 문의
- 브라우저 개발자 도구에서 오류 확인

## 📚 추가 리소스

- [Formspree 공식 문서](https://formspree.io/docs/)
- [JavaScript API 문서](https://formspree.io/docs/javascript/)
- [웹훅 가이드](https://formspree.io/docs/webhooks/)

---

이 가이드를 따라하면 Formspree가 완벽하게 설정되어 웹사이트의 문의 폼이 정상적으로 작동할 것입니다.
