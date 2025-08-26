@echo off
chcp 65001 >nul

echo 🚀 WebCraft Pro 배포를 시작합니다...

REM Formspree ID 확인
findstr "YOUR_FORMSPREE_ID" index.html >nul
if %errorlevel% equ 0 (
    echo ⚠️  경고: Formspree ID가 설정되지 않았습니다.
    echo index.html 파일에서 YOUR_FORMSPREE_ID를 실제 Formspree ID로 교체해주세요.
    echo.
    echo Formspree 설정 방법:
    echo 1. https://formspree.io 에서 계정 생성
    echo 2. 새 폼 생성
    echo 3. 폼 ID 복사
    echo 4. index.html의 YOUR_FORMSPREE_ID를 실제 ID로 교체
    echo.
    set /p continue="계속하시겠습니까? (y/N): "
    if /i not "%continue%"=="y" exit /b 1
)

REM Wrangler 설치 확인
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Wrangler CLI를 설치합니다...
    npm install -g wrangler
)

REM 로그인 확인
echo 🔐 Cloudflare 계정에 로그인합니다...
wrangler login

REM 배포
echo 🚀 Cloudflare Pages에 배포합니다...
wrangler pages publish . --project-name=webcraft-pro

echo ✅ 배포가 완료되었습니다!
echo.
echo 📋 다음 단계:
echo 1. Cloudflare Dashboard에서 배포 상태 확인
echo 2. 커스텀 도메인 설정 (선택사항)
echo 3. Formspree 알림 설정 확인
echo.
echo 🌐 사이트 URL: https://webcraft-pro.pages.dev

pause
