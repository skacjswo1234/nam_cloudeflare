# Cloudflare Pages 배포 가이드

## 🎯 개요

이 가이드는 WebCraft Pro 웹사이트를 Cloudflare Pages에 배포하는 방법을 설명합니다. Cloudflare Pages는 정적 웹사이트를 무료로 호스팅할 수 있는 플랫폼입니다.

## 📋 사전 준비사항

### 1. Cloudflare 계정
- [Cloudflare.com](https://cloudflare.com)에서 무료 계정 생성
- 이메일 인증 완료

### 2. Formspree 계정
- [Formspree.io](https://formspree.io)에서 무료 계정 생성
- 폼 생성 및 ID 획득 (자세한 내용은 `FORMSPREE_SETUP.md` 참조)

### 3. Node.js 설치 (CLI 사용 시)
- [Node.js](https://nodejs.org) 설치 (v14 이상 권장)

## 🚀 배포 방법

### 방법 1: Cloudflare Dashboard 사용 (권장)

#### 1단계: 프로젝트 생성
1. [Cloudflare Dashboard](https://dash.cloudflare.com)에 로그인
2. 왼쪽 메뉴에서 "Pages" 클릭
3. "Create a project" 버튼 클릭
4. "Connect to Git" 선택

#### 2단계: Git 저장소 연결
1. GitHub 또는 GitLab 계정 연결
2. 저장소 선택 또는 새 저장소 생성
3. "Begin setup" 클릭

#### 3단계: 빌드 설정
다음 설정을 입력하세요:

```
Framework preset: None
Build command: (비워두기)
Build output directory: cloudflare-pages
Root directory: (비워두기)
```

#### 4단계: 환경 변수 설정 (선택사항)
필요한 경우 환경 변수를 추가할 수 있습니다.

#### 5단계: 배포
"Save and Deploy" 클릭하여 배포를 시작합니다.

### 방법 2: Wrangler CLI 사용

#### 1단계: Wrangler 설치
```bash
npm install -g wrangler
```

#### 2단계: 로그인
```bash
wrangler login
```

#### 3단계: 배포
```bash
# Windows
cd cloudflare-pages
deploy.bat

# macOS/Linux
cd cloudflare-pages
chmod +x deploy.sh
./deploy.sh
```

### 방법 3: 수동 배포

#### 1단계: 파일 업로드
1. Cloudflare Dashboard에서 Pages 프로젝트 생성
2. "Upload assets" 선택
3. `cloudflare-pages` 폴더의 모든 파일을 압축하여 업로드

## ⚙️ 설정 파일 설명

### _headers
HTTP 헤더 설정 파일입니다:

```text
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/index.html
  Cache-Control: public, max-age=0, must-revalidate

/css/*
  Cache-Control: public, max-age=31536000, immutable
```

### _redirects
URL 리다이렉트 설정 파일입니다:

```text
# Redirect old URLs to new ones
/admin-login.html /index.html 301
/admin.html /index.html 301
/test-contact.html /index.html 301

# Handle 404 errors
/* /index.html 404
```

## 🌐 커스텀 도메인 설정

### 1단계: 도메인 추가
1. Cloudflare Pages 프로젝트에서 "Custom domains" 탭 클릭
2. "Set up a custom domain" 클릭
3. 도메인 입력 (예: `webcraftpro.com`)

### 2단계: DNS 설정
1. 도메인 제공업체에서 DNS 레코드 수정
2. CNAME 레코드 추가:
   ```
   Type: CNAME
   Name: @
   Value: your-project.pages.dev
   ```

### 3단계: SSL 인증서
Cloudflare에서 자동으로 SSL 인증서를 발급합니다.

## 📊 성능 최적화

### 이미지 최적화
- WebP 형식 사용
- 적절한 크기로 리사이징
- Lazy loading 적용

### 캐싱 전략
- 정적 자산은 1년간 캐싱
- HTML 파일은 캐싱하지 않음
- CDN 활용

### 압축
- Gzip 압축 자동 적용
- Brotli 압축 지원

## 🔍 모니터링 및 분석

### Cloudflare Analytics
1. Pages 프로젝트에서 "Analytics" 탭 확인
2. 방문자 통계, 성능 지표 확인

### 실시간 로그
1. "Functions" 탭에서 실시간 로그 확인
2. 오류 및 성능 문제 모니터링

## 🔧 문제 해결

### 일반적인 문제들

#### 배포 실패
- 빌드 로그 확인
- 파일 경로 확인
- 권한 설정 확인

#### 폼이 작동하지 않음
- Formspree ID 확인
- 네트워크 연결 확인
- 브라우저 콘솔에서 오류 확인

#### 이미지가 로드되지 않음
- 파일 경로 확인
- 파일명 대소문자 확인
- 파일 존재 여부 확인

### 디버깅 방법

#### 브라우저 개발자 도구
1. F12 키로 개발자 도구 열기
2. Console 탭에서 오류 확인
3. Network 탭에서 요청 상태 확인

#### Cloudflare 로그
1. Pages 프로젝트에서 "Functions" 탭
2. 실시간 로그 확인
3. 오류 메시지 분석

## 📱 모바일 최적화

### 반응형 디자인
- 모든 화면 크기에서 최적화
- 터치 친화적 인터페이스
- 빠른 로딩 속도

### PWA 지원 (선택사항)
- Service Worker 추가
- 매니페스트 파일 생성
- 오프라인 지원

## 🔒 보안 설정

### HTTPS 강제
- 모든 HTTP 요청을 HTTPS로 리다이렉트
- HSTS 헤더 설정

### CSP (Content Security Policy)
- XSS 공격 방지
- 리소스 로딩 제한

### 보안 헤더
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## 📈 확장성

### 트래픽 증가 대응
- Cloudflare의 글로벌 CDN 활용
- 자동 스케일링
- DDoS 보호

### 백업 및 복구
- Git 저장소에 소스 코드 백업
- 정기적인 배포 테스트
- 롤백 계획 수립

## 💰 비용

### 무료 플랜
- 월 100,000 요청
- 무제한 대역폭
- 커스텀 도메인 지원

### 유료 플랜
- 더 많은 요청 수
- 고급 기능
- 우선 지원

## 📞 지원

### Cloudflare 지원
- [Cloudflare 문서](https://developers.cloudflare.com/pages/)
- [커뮤니티 포럼](https://community.cloudflare.com/)

### 개발자 지원
- 이메일: 9078807@naver.com
- 전화: 010-7539-0242
- 카카오톡: 9078807a

---

이 가이드를 따라하면 WebCraft Pro 웹사이트가 Cloudflare Pages에 성공적으로 배포됩니다.
