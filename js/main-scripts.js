document.addEventListener('DOMContentLoaded', function () {
    // --- Cache all necessary elements from the page ---
    const preloader = document.getElementById('preloader');
    const header = document.getElementById('main-header');
    const animatedBranch = document.getElementById('animated-branch'); // Specific to index.html
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminModalOverlay = document.getElementById('admin-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const adminLoginForm = document.getElementById('admin-login-form');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    // --- 1. PRELOADER LOGIC ---
    // Hide the preloader once all content (including images) is fully loaded.
    window.onload = () => {
        if (preloader) {
            preloader.classList.add('preloader-hidden');
            preloader.addEventListener('transitionend', () => {
                preloader.style.display = 'none';
            });
        }
    };

    // --- 2. SCROLL-BASED EVENTS HANDLER ---
    function handleScrollEvents() {
        if (!header) return;
        const scrollTop = window.scrollY;

        // a) Header Style Change (Solid on Scroll)
        // Adds 'scrolled' class if scrolled more than 50px, otherwise removes it.
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // b) Branch "Growing" Animation (only runs if the branch element exists)
        if (animatedBranch) {
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollFraction = scrollableHeight > 0 ? scrollTop / scrollableHeight : 0;
            const scrollPercent = Math.min(1, scrollFraction) * 100;
            animatedBranch.style.maskSize = `${scrollPercent}% 100%`;
        }
    }

    // Attach the scroll event listener
    window.addEventListener('scroll', handleScrollEvents);
    // Run once on load to set the correct initial header state
    handleScrollEvents();

    // --- 3. ADMIN LOGIN MODAL LOGIC ---
    const ADMIN_EMAIL = "suman@koley.com";
    const ADMIN_PASS = "password123";

    if (adminLoginBtn && adminModalOverlay && closeModalBtn) {
        adminLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            adminModalOverlay.classList.remove('hidden');
        });

        closeModalBtn.addEventListener('click', () => {
            adminModalOverlay.classList.add('hidden');
        });

        adminModalOverlay.addEventListener('click', (e) => {
            if (e.target === adminModalOverlay) {
                adminModalOverlay.classList.add('hidden');
            }
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            const errorMsg = document.getElementById('login-error-msg');
            errorMsg.textContent = ''; // Clear previous errors

            if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
                window.location.href = 'admin.html';
            } else {
                errorMsg.textContent = 'Invalid credentials. Please try again.';
            }
        });
    }
    
    // --- 4. MOBILE MENU TOGGLE ---
    if(menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
});
