# 배경 동영상 파일 가이드

## 📁 필요한 동영상 파일들

### 1. 히어로 섹션 배경 동영상
- **파일명**: `hero-bg.mp4`
- **용도**: 메인 히어로 섹션 배경
- **권장 내용**: 도시 풍경, 비즈니스 환경, 자연과 도시의 조화

### 2. About 섹션 배경 동영상
- **파일명**: `about-bg.mp4`
- **용도**: 회사 소개 섹션 배경
- **권장 내용**: 팀워크, 창의적 작업 환경, 기술적 과정

## 🎬 동영상 제작 가이드라인

### 기술적 요구사항
- **해상도**: 1920x1080 (Full HD) 또는 1280x720 (HD)
- **포맷**: MP4 (H.264 코덱)
- **파일 크기**: 5-15MB (최적화)
- **길이**: 10-30초 (루프 재생)
- **프레임 레이트**: 24-30fps

### 콘텐츠 가이드라인
- **히어로 섹션**: 
  - 도시의 활기찬 모습
  - 비즈니스 환경
  - 자연과 도시의 조화
  - 웹사이트/디지털 관련 요소

- **About 섹션**:
  - 팀워크 장면
  - 창의적 작업 환경
  - 기술적 과정
  - 성공적인 프로젝트 완료

### 무료 동영상 소스
1. **Pexels Videos**: https://www.pexels.com/videos/
2. **Pixabay**: https://pixabay.com/videos/
3. **Coverr.co**: https://coverr.co/
4. **Videvo**: https://www.videvo.net/

### 유료 동영상 소스
1. **Shutterstock**: https://www.shutterstock.com/video
2. **Adobe Stock**: https://stock.adobe.com/video
3. **Envato Elements**: https://elements.envato.com/video

## 🔧 최적화 팁

### 파일 크기 최적화
```bash
# FFmpeg를 사용한 최적화 예시
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

### WebM 포맷 변환 (선택사항)
```bash
# WebM 포맷으로 변환 (더 작은 파일 크기)
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm
```

## 📱 모바일 최적화

- 모바일에서는 자동으로 음소거됨
- 느린 네트워크에서는 대체 이미지로 전환
- 성능 최적화를 위해 스크롤 시 일시정지

## 🎨 오버레이 설정

동영상 위에 오버레이를 적용하여 텍스트 가독성을 높였습니다:
- 히어로 섹션: 다크 그라데이션 오버레이
- About 섹션: 라이트 오버레이

## ⚠️ 주의사항

1. **저작권**: 무료 라이선스 확인 필수
2. **성능**: 파일 크기 최적화 중요
3. **접근성**: 대체 이미지 제공
4. **모바일**: 자동 음소거 및 성능 최적화
