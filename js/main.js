// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initSmoothScrolling();
    initContactForm();
    initChatWidget();
    initScrollEffects();
    initMobileMenu();
    initVideoBackgrounds();
    initHeroAnimations();
    initServicesAnimations();
});

// Navigation functionality
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navbarLinks = document.querySelectorAll('.navbar__link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'var(--white)';
            navbar.style.backdropFilter = 'none';
        }
    });
    
    // Active link highlighting
    navbarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navbarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Contact form handling
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!validateForm(data)) {
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '전송 중...';
            submitBtn.disabled = true;
            
            // Send form data to Google Sheets
            const contactData = {
                id: Date.now(), // 임시 ID (Google Sheets에서 자동 생성 가능)
                name: data.name,
                email: data.email,
                phone: data.phone,
                service: data.service,
                message: data.message,
                isRead: false,
                createdAt: new Date().toISOString()
            };
            
            // Google Sheets에 추가
            addToSheet('Contacts', contactToSheetRow(contactData))
                .then((result) => {
                    console.log('Add result:', result);
                    if (result && result.success) {
                        showSuccessMessage();
                        this.reset();
                    } else if (result && result.error) {
                        console.error('Server error:', result.error);
                        showErrorMessage('상담 신청에 실패했습니다: ' + result.error);
                    } else {
                        // no-cors 모드에서는 응답을 확인할 수 없지만 요청은 전송됨
                        showSuccessMessage();
                        this.reset();
                        console.log('Data submitted (response not available in no-cors mode)');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showErrorMessage('상담 신청에 실패했습니다. 잠시 후 다시 시도해주세요.');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
}

// Form validation
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('이름을 입력해주세요 (2자 이상)');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('올바른 이메일을 입력해주세요');
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        errors.push('올바른 전화번호를 입력해주세요');
    }
    
    if (!data.service) {
        errors.push('서비스를 선택해주세요');
    }
    
    if (!data.message || data.message.trim().length < 1) {
        errors.push('요구사항을 입력해주세요');
    }
    
    if (errors.length > 0) {
        showErrorMessage(errors.join('\n'));
        return false;
    }
    
    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[0-9-+\s()]+$/;
    return phoneRegex.test(phone) && phone.replace(/[^0-9]/g, '').length >= 10;
}

// Success message
function showSuccessMessage(messageText = '✅ 상담 신청이 완료되었습니다!<br>빠른 시일 내에 연락드리겠습니다.') {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        ">
            ${messageText}
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Error message
function showErrorMessage(errorText) {
    const message = document.createElement('div');
    message.className = 'error-message';
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            white-space: pre-line;
        ">
            ❌ ${errorText}
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Chat widget functionality
function initChatWidget() {
    const chatButton = document.getElementById('chatButton');
    const chatPopup = document.getElementById('chatPopup');
    const chatClose = document.getElementById('chatClose');
    
    if (chatButton && chatPopup && chatClose) {
        // Open chat popup
        chatButton.addEventListener('click', function() {
            chatPopup.classList.add('active');
        });
        
        // Close chat popup
        chatClose.addEventListener('click', function() {
            chatPopup.classList.remove('active');
        });
        
        // Close on outside click
        document.addEventListener('click', function(e) {
            if (!chatButton.contains(e.target) && !chatPopup.contains(e.target)) {
                chatPopup.classList.remove('active');
            }
        });
    }
    
    // 카카오톡 프로필 채팅 링크 복사 기능 (개선된 버전)
    window.copyKakaoLink = function() {
        const kakaoLink = 'http://pf.kakao.com/_Brxexmn/chat';
        
        // 복사 성공 시 시각적 피드백을 위한 버튼 상태 변경
        const copyButton = document.querySelector('.chat-widget__option--secondary');
        const originalContent = copyButton.innerHTML;
        
        // 버튼을 복사 중 상태로 변경
        copyButton.innerHTML = `
            <div class="chat-widget__option-icon">✅</div>
            <div class="chat-widget__option-content">
                <h6>복사 완료!</h6>
                <p>링크가 클립보드에 복사되었습니다</p>
            </div>
            <div class="chat-widget__option-arrow">✓</div>
        `;
        copyButton.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        copyButton.style.color = '#fff';
        
        // 복사 시도
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(kakaoLink).then(() => {
                showSuccessMessage('✅ 카카오톡 프로필 채팅 링크가 클립보드에 복사되었습니다!\n\n링크: ' + kakaoLink);
                
                // 3초 후 버튼 원래 상태로 복원
                setTimeout(() => {
                    copyButton.innerHTML = originalContent;
                    copyButton.style.background = '';
                    copyButton.style.color = '';
                }, 3000);
            }).catch((err) => {
                console.error('클립보드 복사 실패:', err);
                fallbackCopyTextToClipboard(kakaoLink, copyButton, originalContent);
            });
        } else {
            fallbackCopyTextToClipboard(kakaoLink, copyButton, originalContent);
        }
    };

    // 카카오톡 프로필 채팅 바로가기 기능
    window.openKakaoChat = function() {
        const kakaoProfileUrl = 'http://pf.kakao.com/_Brxexmn/chat';
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // 모바일에서는 카카오톡 앱으로 직접 연결
            window.open(kakaoProfileUrl, '_blank');
        } else {
            // 데스크톱에서도 프로필 채팅으로 연결
            window.open(kakaoProfileUrl, '_blank');
        }
    };

    // 폴백 복사 함수 (개선된 버전)
    function fallbackCopyTextToClipboard(text, copyButton, originalContent) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 2em;
            height: 2em;
            padding: 0;
            border: none;
            outline: none;
            boxShadow: none;
            background: transparent;
            opacity: 0;
            z-index: -1;
        `;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showSuccessMessage('✅ 카카오톡 프로필 채팅 링크가 클립보드에 복사되었습니다!\n\n링크: ' + text);
                
                // 3초 후 버튼 원래 상태로 복원
                setTimeout(() => {
                    if (copyButton && originalContent) {
                        copyButton.innerHTML = originalContent;
                        copyButton.style.background = '';
                        copyButton.style.color = '';
                    }
                }, 3000);
            } else {
                showErrorMessage('❌ 프로필 채팅 링크 복사에 실패했습니다.\n\n수동으로 복사해주세요:\n' + text);
                
                // 버튼을 실패 상태로 변경
                if (copyButton) {
                    copyButton.innerHTML = `
                        <div class="chat-widget__option-icon">❌</div>
                        <div class="chat-widget__option-content">
                            <h6>복사 실패</h6>
                            <p>수동으로 복사해주세요</p>
                        </div>
                        <div class="chat-widget__option-arrow">!</div>
                    `;
                    copyButton.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
                    copyButton.style.color = '#fff';
                    
                    setTimeout(() => {
                        copyButton.innerHTML = originalContent;
                        copyButton.style.background = '';
                        copyButton.style.color = '';
                    }, 3000);
                }
            }
        } catch (err) {
            console.error('폴백 복사 실패:', err);
            showErrorMessage('❌ 링크 복사에 실패했습니다.\n\n수동으로 복사해주세요:\n' + text);
            
            // 버튼을 실패 상태로 변경
            if (copyButton) {
                copyButton.innerHTML = `
                    <div class="chat-widget__option-icon">❌</div>
                    <div class="chat-widget__option-content">
                        <h6>복사 실패</h6>
                        <p>수동으로 복사해주세요</p>
                    </div>
                    <div class="chat-widget__option-arrow">!</div>
                `;
                copyButton.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
                copyButton.style.color = '#fff';
                
                setTimeout(() => {
                    copyButton.innerHTML = originalContent;
                    copyButton.style.background = '';
                    copyButton.style.color = '';
                }, 3000);
            }
        }
        
        document.body.removeChild(textArea);
    }

    // 성공 메시지 표시 (개선된 버전)
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 1.2rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
            z-index: 10000;
            animation: slideInSuccess 0.4s ease;
            white-space: pre-line;
            max-width: 350px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            font-weight: 500;
        `;
        successDiv.innerHTML = message;
        document.body.appendChild(successDiv);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 300);
        }, 5000);
    }

    // 실패 메시지 표시 (개선된 버전)
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
            padding: 1.2rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3);
            z-index: 10000;
            animation: slideInError 0.4s ease;
            white-space: pre-line;
            max-width: 350px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            font-weight: 500;
        `;
        errorDiv.innerHTML = message;
        document.body.appendChild(errorDiv);
        
        // 6초 후 자동 제거
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 300);
        }, 6000);
    }

    // 정보 메시지 표시 (개선된 버전)
    function showInfoMessage(message) {
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #17a2b8, #138496);
            color: white;
            padding: 1.2rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(23, 162, 184, 0.3);
            z-index: 10000;
            animation: slideInInfo 0.4s ease;
            white-space: pre-line;
            max-width: 350px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            font-weight: 500;
        `;
        infoDiv.innerHTML = message;
        document.body.appendChild(infoDiv);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            infoDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (infoDiv.parentNode) {
                    infoDiv.remove();
                }
            }, 300);
        }, 5000);
    }
}

// Scroll effects and animations
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service__card, .portfolio__item, .testimonial__card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroImage = document.querySelector('.hero__image');
        
        if (hero && heroImage) {
            const rate = scrolled * -0.5;
            heroImage.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileToggle = document.querySelector('.navbar__mobile-toggle');
    const navbarMenu = document.querySelector('.navbar__menu');
    
    if (mobileToggle && navbarMenu) {
        mobileToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = navbarMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .navbar__menu.active {
        display: flex !important;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--white);
        box-shadow: var(--shadow);
        padding: 1rem;
        gap: 1rem;
    }
    
    .navbar__mobile-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .navbar__mobile-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .navbar__mobile-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .navbar__link.active {
        color: var(--primary-black) !important;
    }
    
    .success-message, .error-message {
        animation: slideIn 0.3s ease;
    }
    
    /* 개선된 카카오톡 상담 위젯 스타일 */
    .chat-widget__button {
        position: relative;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #FEE500, #FFD700);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(254, 229, 0, 0.4);
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .chat-widget__button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(254, 229, 0, 0.6);
    }
    
    .chat-widget__icon {
        font-size: 1.5rem;
        color: #000;
        z-index: 2;
    }
    
    .chat-widget__pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(254, 229, 0, 0.6);
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(1.5);
            opacity: 0;
        }
    }
    
    .chat-widget__popup {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 320px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: all 0.3s ease;
        z-index: 999;
    }
    
    .chat-widget__popup.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .chat-widget__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 1.5rem 1rem;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .chat-widget__title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .chat-widget__title-icon {
        font-size: 1.5rem;
    }
    
    .chat-widget__title-text h4 {
        margin: 0;
        font-size: 1.1rem;
        color: #333;
    }
    
    .chat-widget__title-text p {
        margin: 0;
        font-size: 0.8rem;
        color: #666;
    }
    
    .chat-widget__close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .chat-widget__close:hover {
        background: #f5f5f5;
        color: #333;
    }
    
    .chat-widget__content {
        padding: 1.5rem;
    }
    
    .chat-widget__welcome {
        text-align: center;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        border-radius: 12px;
    }
    
    .chat-widget__welcome-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    
    .chat-widget__welcome h5 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.1rem;
    }
    
    .chat-widget__welcome p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    .chat-widget__options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }
    
    .chat-widget__option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        background: #f8f9fa;
    }
    
    .chat-widget__option:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .chat-widget__option--primary {
        background: linear-gradient(135deg, #FEE500, #FFD700);
        color: #000;
    }
    
    .chat-widget__option--primary:hover {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: #000;
    }
    
    .chat-widget__option--secondary {
        background: #f8f9fa;
        color: #333;
    }
    
    .chat-widget__option--secondary:hover {
        background: #e9ecef;
        color: #333;
    }
    
    .chat-widget__option-icon {
        font-size: 1.2rem;
        width: 24px;
        text-align: center;
    }
    
    .chat-widget__option-content {
        flex: 1;
    }
    
    .chat-widget__option-content h6 {
        margin: 0 0 0.25rem 0;
        font-size: 0.95rem;
        font-weight: 600;
    }
    
    .chat-widget__option-content p {
        margin: 0;
        font-size: 0.8rem;
        color: #666;
        line-height: 1.3;
    }
    
    .chat-widget__option-arrow {
        font-size: 1.2rem;
        color: #999;
        transition: transform 0.3s ease;
    }
    
    .chat-widget__option:hover .chat-widget__option-arrow {
        transform: translateX(3px);
    }
    
    .chat-widget__footer {
        text-align: center;
        padding-top: 1rem;
        border-top: 1px solid #f0f0f0;
    }
    
    .chat-widget__footer p {
        margin: 0;
        font-size: 0.75rem;
        color: #999;
    }
`;
document.head.appendChild(style);

// Performance optimization: Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
initLazyLoading();

// Add loading animation for page load
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Video background functionality
function initVideoBackgrounds() {
    const videos = document.querySelectorAll('.hero__video, .about__video');
    
    videos.forEach(video => {
        // 동영상 로드 완료 시 처리
        video.addEventListener('loadeddata', function() {
            console.log('Video loaded successfully:', this.src || this.currentSrc);
            this.style.opacity = '1';
        });
        
        // 동영상 로드 시작 시 처리
        video.addEventListener('loadstart', function() {
            console.log('Video loading started:', this.src || this.currentSrc);
        });
        
        // 동영상 재생 오류 처리
        video.addEventListener('error', function() {
            console.warn('Video failed to load:', this.src);
            // 대체 이미지로 전환
            this.style.display = 'none';
            const fallback = this.parentElement.querySelector('img');
            if (fallback) {
                fallback.style.display = 'block';
            }
        });
        
        // 모바일에서 성능 최적화
        if (window.innerWidth <= 768) {
            video.setAttribute('muted', 'true');
            video.setAttribute('playsinline', 'true');
        }
        
        // 네트워크 상태에 따른 품질 조정
        if (navigator.connection) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                video.style.display = 'none';
                const fallback = this.parentElement.querySelector('img');
                if (fallback) {
                    fallback.style.display = 'block';
                }
            }
        }
    });
    
    // 스크롤 시 동영상 일시정지 (성능 최적화)
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        videos.forEach(video => {
            video.pause();
        });
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            videos.forEach(video => {
                video.play().catch(e => console.log('Video play failed:', e));
            });
        }, 100);
    });
}

// Hero animations functionality
function initHeroAnimations() {
    // Animate stats numbers
    const stats = document.querySelectorAll('.hero__stat-number');
    
    const animateNumber = (element, target) => {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (target === 98 ? '%' : target === 24 ? '/7' : '+');
        }, 50);
    };
    
    // Intersection Observer for stats animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const text = statNumber.textContent;
                
                if (text.includes('500')) {
                    animateNumber(statNumber, 500);
                } else if (text.includes('98')) {
                    animateNumber(statNumber, 98);
                } else if (text.includes('24')) {
                    statNumber.textContent = '24/7';
                }
                
                statsObserver.unobserve(statNumber);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => statsObserver.observe(stat));
    
    // Enhanced parallax effect for floating elements
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const floatingElements = document.querySelectorAll('.hero__floating-element');
        const particles = document.querySelectorAll('.hero__particle');
        const lines = document.querySelectorAll('.hero__line');
        
        floatingElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
        });
        
        // Parallax for particles
        particles.forEach((particle, index) => {
            const speed = 0.3 + (index * 0.05);
            const yPos = -(scrolled * speed);
            particle.style.transform = `translateY(${yPos}px)`;
        });
        
        // Parallax for lines
        lines.forEach((line, index) => {
            const speed = 0.2 + (index * 0.1);
            const xPos = -(scrolled * speed);
            line.style.transform = `translateX(${xPos}px)`;
        });
    });
    
    // Enhanced floating elements interaction
    const floatingElements = document.querySelectorAll('.hero__floating-element');
    floatingElements.forEach((element, index) => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2) rotate(45deg)';
            this.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.6)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
        });
    });

    // Particle interaction
    const particles = document.querySelectorAll('.hero__particle');
    particles.forEach(particle => {
        particle.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(2)';
            this.style.background = 'var(--hero-yellow-dark)';
        });
        
        particle.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.background = 'var(--hero-yellow)';
        });
    });

    // Dynamic line effects
    const lines = document.querySelectorAll('.hero__line');
    lines.forEach(line => {
        line.addEventListener('mouseenter', function() {
            this.style.height = '4px';
            this.style.opacity = '0.6';
        });
        
        line.addEventListener('mouseleave', function() {
            this.style.height = '2px';
            this.style.opacity = '0.3';
        });
    });
    
    // Service button hover effects
    const serviceButtons = document.querySelectorAll('.service-btn');
    
    serviceButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 3D Device Interaction
    const devices = document.querySelectorAll('.hero__device');
    
    devices.forEach(device => {
        device.addEventListener('mouseenter', function() {
            this.style.transform = this.style.transform.replace('rotateY', 'rotateY').replace('rotateX', 'rotateX');
            this.style.zIndex = '10';
            this.style.boxShadow = '0 30px 60px rgba(255, 215, 0, 0.3)';
        });
        
        device.addEventListener('mouseleave', function() {
            this.style.zIndex = '';
            this.style.boxShadow = '';
        });
    });

    // Interactive Code Blocks
    const codeBlocks = document.querySelectorAll('.hero__code-block');
    
    codeBlocks.forEach(block => {
        block.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
            this.style.zIndex = '5';
            this.style.background = 'rgba(0, 0, 0, 0.9)';
        });
        
        block.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.zIndex = '';
            this.style.background = 'rgba(0, 0, 0, 0.8)';
        });
    });

    // Performance Metrics Animation
    const metrics = document.querySelectorAll('.hero__metric');
    
    metrics.forEach((metric, index) => {
        metric.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.background = 'rgba(255, 215, 0, 0.1)';
        });
        
        metric.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.background = 'transparent';
        });
    });

    // 3D Parallax Effect for Devices
    window.addEventListener('mousemove', function(e) {
        const devices = document.querySelectorAll('.hero__device');
        const rect = document.querySelector('.hero__3d-preview').getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        devices.forEach((device, index) => {
            const speed = 0.02 + (index * 0.01);
            const x = (e.clientX - centerX) * speed;
            const y = (e.clientY - centerY) * speed;
            
            device.style.transform += ` translate(${x}px, ${y}px)`;
        });
    });
}

// Services animations functionality
function initServicesAnimations() {
    // Service card hover effects
    const serviceCards = document.querySelectorAll('.service__card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add glow effect
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
            
            // Animate icon
            const icon = this.querySelector('.service__icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
            
            // Animate features
            const features = this.querySelectorAll('.service__feature');
            features.forEach((feature, index) => {
                setTimeout(() => {
                    feature.style.transform = 'translateX(10px)';
                    feature.style.background = 'rgba(255, 255, 255, 0.4)';
                }, index * 100);
            });
        });
        
        card.addEventListener('mouseleave', function() {
            // Remove glow effect
            this.style.boxShadow = '';
            
            // Reset icon
            const icon = this.querySelector('.service__icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
            
            // Reset features
            const features = this.querySelectorAll('.service__feature');
            features.forEach(feature => {
                feature.style.transform = 'translateX(0)';
                feature.style.background = 'rgba(255, 255, 255, 0.2)';
            });
        });
    });
    
    // Services stats animation
    const servicesStats = document.querySelectorAll('.services__stat-number');
    
    const animateServicesNumber = (element, target) => {
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (target === 100 ? '%' : target === 24 ? '/7' : '');
        }, 50);
    };
    
    // Intersection Observer for services stats
    const servicesStatsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const text = statNumber.textContent;
                
                if (text.includes('100')) {
                    animateServicesNumber(statNumber, 100);
                } else if (text.includes('24')) {
                    statNumber.textContent = '24/7';
                } else if (text.includes('빠른')) {
                    statNumber.textContent = '빠른';
                }
                
                servicesStatsObserver.unobserve(statNumber);
            }
        });
    }, { threshold: 0.5 });
    
    servicesStats.forEach(stat => servicesStatsObserver.observe(stat));
    
    // Parallax effect for services floating elements
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const servicesSection = document.querySelector('.services');
        
        if (servicesSection) {
            const rect = servicesSection.getBoundingClientRect();
            const floatingElements = servicesSection.querySelectorAll('.services__floating-element');
            
            floatingElements.forEach((element, index) => {
                const speed = 0.3 + (index * 0.1);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.05}deg)`;
            });
        }
    });
}

// Add CSS for page load animation
const loadStyle = document.createElement('style');
loadStyle.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    /* Video loading animation */
    .hero__video, .about__video, .services__video {
        opacity: 0;
        transition: opacity 1s ease;
    }
    
    .hero__video.loaded, .about__video.loaded, .services__video.loaded {
        opacity: 1;
    }
    
    /* Enhanced animations */
    .service-btn {
        transform-origin: center;
    }
    
    .hero__floating-element, .services__floating-element {
        will-change: transform;
    }
    
    .hero__mockup {
        will-change: transform;
    }
    
    /* Services specific animations */
    .service__card {
        transform-origin: center;
    }
    
    .service__feature {
        transition: all 0.3s ease;
    }
    
    .services__cta-btn {
        transform-origin: center;
    }
    
    /* Portfolio specific animations */
    .portfolio__item {
        transform-origin: center;
    }
    
    .portfolio__floating-element {
        will-change: transform;
    }
    
    .portfolio__grid-line {
        will-change: transform, opacity;
    }
    
    .tech-tag {
        transition: all 0.3s ease;
    }
    
    .portfolio__view-btn {
        transform-origin: center;
    }
    
    .portfolio__cta-btn {
        transform-origin: center;
    }
    
    @keyframes portfolioTagFloat {
        0% {
            transform: translateY(0) scale(1);
        }
        50% {
            transform: translateY(-5px) scale(1.1);
        }
        100% {
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes portfolioBtnPulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(loadStyle);

// Portfolio animations functionality
function initPortfolioAnimations() {
    // Portfolio items interaction
    const portfolioItems = document.querySelectorAll('.portfolio__item');
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            // Animate tech stack tags
            const techTags = this.querySelectorAll('.tech-tag');
            techTags.forEach((tag, index) => {
                tag.style.animationDelay = `${index * 0.1}s`;
                tag.style.animation = 'portfolioTagFloat 0.6s ease-out forwards';
            });
            
            // Animate view button
            const viewBtn = this.querySelector('.portfolio__view-btn');
            if (viewBtn) {
                viewBtn.style.animation = 'portfolioBtnPulse 0.8s ease-out forwards';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            // Reset tech stack tags
            const techTags = this.querySelectorAll('.tech-tag');
            techTags.forEach(tag => {
                tag.style.animation = '';
            });
            
            // Reset view button
            const viewBtn = this.querySelector('.portfolio__view-btn');
            if (viewBtn) {
                viewBtn.style.animation = '';
            }
        });
    });
    
    // Portfolio stats animation
    const portfolioStats = document.querySelectorAll('.portfolio__stat-number');
    const portfolioStatsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const text = statNumber.textContent;
                
                if (text.includes('15')) {
                    animatePortfolioNumber(statNumber, 15);
                } else if (text.includes('12')) {
                    animatePortfolioNumber(statNumber, 12);
                } else if (text.includes('20')) {
                    animatePortfolioNumber(statNumber, 20);
                } else if (text.includes('98')) {
                    animatePortfolioNumber(statNumber, 98);
                } else if (text.includes('99')) {
                    animatePortfolioNumber(statNumber, 99);
                } else if (text.includes('97')) {
                    animatePortfolioNumber(statNumber, 97);
                }
                
                portfolioStatsObserver.unobserve(statNumber);
            }
        });
    }, { threshold: 0.5 });
    
    portfolioStats.forEach(stat => portfolioStatsObserver.observe(stat));
    
    // Portfolio floating elements interaction
    const portfolioFloatingElements = document.querySelectorAll('.portfolio__floating-element');
    portfolioFloatingElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.5) rotate(90deg)';
            this.style.opacity = '0.5';
            this.style.background = 'var(--hero-yellow-dark)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.opacity = '0.1';
            this.style.background = 'var(--hero-yellow)';
        });
    });
    
    // Portfolio grid lines interaction
    const portfolioGridLines = document.querySelectorAll('.portfolio__grid-line');
    portfolioGridLines.forEach(line => {
        line.addEventListener('mouseenter', function() {
            this.style.opacity = '0.6';
            this.style.height = '3px';
        });
        
        line.addEventListener('mouseleave', function() {
            this.style.opacity = '0.1';
            this.style.height = '1px';
        });
    });
    
    // Portfolio CTA buttons interaction
    const portfolioCtaButtons = document.querySelectorAll('.portfolio__cta-btn');
    portfolioCtaButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Portfolio parallax effect
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const portfolioSection = document.querySelector('.portfolio');
        if (portfolioSection) {
            const rect = portfolioSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const floatingElements = document.querySelectorAll('.portfolio__floating-element');
                const gridLines = document.querySelectorAll('.portfolio__grid-line');
                
                floatingElements.forEach((element, index) => {
                    const speed = 0.3 + (index * 0.05);
                    const yPos = -(scrolled * speed);
                    element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.02}deg)`;
                });
                
                gridLines.forEach((line, index) => {
                    const speed = 0.2 + (index * 0.1);
                    const xPos = -(scrolled * speed);
                    line.style.transform = `translateX(${xPos}px)`;
                });
            }
        }
    });
    
    // Portfolio number animation function
    function animatePortfolioNumber(element, target) {
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (target >= 90 ? '%' : '일');
        }, 50);
    }
}

// Initialize portfolio animations
document.addEventListener('DOMContentLoaded', function() {
    initPortfolioAnimations();
});





// Portfolio view function
function viewPortfolio(category) {
    // 포트폴리오 카테고리별 URL 설정
    const portfolioUrls = {
        'real-estate': '#', // 나중에 도메인으로 변경 예정
        'shopping': '#',
        'corporate': '#',
        'booking': '#',
        'maintenance': '#',
        'custom': '#'
    };
    
    const url = portfolioUrls[category];
    
    if (url === '#') {
        // 아직 URL이 설정되지 않은 경우
        showMessage('포트폴리오 상세 페이지 준비 중입니다. 곧 업데이트될 예정입니다.', 'info');
    } else {
        // URL이 설정된 경우 새 창에서 열기
        window.open(url, '_blank');
    }
}
