# WebCraft Pro - Cloudflare Pages 배포

이 프로젝트는 Cloudflare Pages를 사용하여 정적 웹사이트로 배포됩니다.

## 🚀 배포 방법

### 1. Formspree 설정

1. [Formspree](https://formspree.io)에 가입하고 새 폼을 생성합니다.
2. 생성된 폼의 ID를 복사합니다 (예: `xrgjqkqr`)
3. `index.html` 파일에서 다음 부분을 수정합니다:

```html
<form class="contact__form" id="contactForm" action="https://formspree.io/f/YOUR_FORMSPREE_ID" method="POST">
```

`YOUR_FORMSPREE_ID`를 실제 Formspree ID로 교체합니다.

### 2. Cloudflare Pages 배포

#### 방법 1: Cloudflare Dashboard 사용

1. [Cloudflare Dashboard](https://dash.cloudflare.com)에 로그인
2. "Pages" 섹션으로 이동
3. "Create a project" 클릭
4. "Connect to Git" 선택
5. GitHub/GitLab 저장소 연결
6. 빌드 설정:
   - Framework preset: None
   - Build command: (비워두기)
   - Build output directory: `cloudflare-pages`
   - Root directory: (비워두기)

#### 방법 2: Wrangler CLI 사용

1. Wrangler CLI 설치:
```bash
npm install -g wrangler
```

2. 로그인:
```bash
wrangler login
```

3. 배포:
```bash
wrangler pages publish cloudflare-pages --project-name=webcraft-pro
```

### 3. 커스텀 도메인 설정 (선택사항)

1. Cloudflare Pages 프로젝트에서 "Custom domains" 섹션으로 이동
2. "Set up a custom domain" 클릭
3. 도메인 입력 및 DNS 설정

## 📁 파일 구조

```
cloudflare-pages/
├── index.html          # 메인 페이지
├── css/
│   └── style.css       # 스타일시트
├── js/
│   └── main.js         # JavaScript
├── images/             # 이미지 파일들
├── videos/             # 비디오 파일들
├── _headers            # HTTP 헤더 설정
├── _redirects          # 리다이렉트 설정
└── README.md           # 이 파일
```

## 🔧 주요 기능

- ✅ 반응형 디자인
- ✅ Formspree 연동 (문의 폼)
- ✅ 카카오톡 상담 위젯
- ✅ 애니메이션 효과
- ✅ SEO 최적화
- ✅ 성능 최적화

## 📧 문의 폼 설정

Formspree에서 다음 필드들이 자동으로 처리됩니다:

- `name`: 이름
- `email`: 이메일
- `phone`: 전화번호
- `service`: 서비스 유형
- `message`: 요구사항

## 🎨 커스터마이징

### 색상 변경
`css/style.css` 파일의 CSS 변수를 수정하여 색상을 변경할 수 있습니다:

```css
:root {
  --primary-black: #000000;
  --hero-yellow: #FFD700;
  /* 기타 색상들... */
}
```

### 내용 수정
`index.html` 파일에서 텍스트 내용을 수정할 수 있습니다.

## 🔍 SEO 최적화

- 메타 태그 최적화
- Open Graph 태그
- 구조화된 데이터
- 사이트맵 자동 생성

## 📱 모바일 최적화

- 반응형 디자인
- 터치 친화적 인터페이스
- 모바일 성능 최적화

## 🚀 성능 최적화

- 이미지 최적화
- CSS/JS 압축
- 캐싱 전략
- CDN 활용

## 📞 지원

문제가 발생하거나 도움이 필요하시면:

- 📧 이메일: 9078807@naver.com
- 📱 전화: 010-7539-0242
- 💬 카카오톡: 9078807a

---

© 2025 WebCraft Pro. All rights reserved.
