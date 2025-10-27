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

    // Function to handle hiding the preloader
    const hidePreloader = () => {
        if (preloader) {
            preloader.classList.add('preloader-hidden');
            preloader.addEventListener('transitionend', () => {
                preloader.style.display = 'none';
            });
        }
    };

    // Check if we are on the homepage (index.html or root path)
    const path = window.location.pathname;
    const isHomePage = (path === '/' || path.endsWith('index.html'));

    if (isHomePage && preloader) {
        // --- Homepage: Run simulated progress animation ---
        const progressBarFill = document.querySelector('.progress-bar-fill');
        const progressText = document.querySelector('.progress-text');
        let progress = 0;

        // Ensure progress elements exist before starting interval
        if (progressBarFill && progressText) {
            const interval = setInterval(() => {
                progress += 1;
                progressBarFill.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;

                if (progress >= 100) {
                    clearInterval(interval);
                    // Wait a moment after 100% before fading
                    setTimeout(hidePreloader, 400); 
                }
            }, 10); // ~3 seconds total
        } else {
             // Fallback: hide preloader immediately if elements are missing
             hidePreloader();
        }

    } else if (preloader) {
        // --- Other Pages: Wait for full load (window.onload) ---
        // This is the part your code was stuck in.
        // Now it will only run on internal pages.
        window.onload = hidePreloader;
    }

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

    }

    // Attach the scroll event listener
    window.addEventListener('scroll', handleScrollEvents);
    // Run once on load to set the correct initial header state
    handleScrollEvents()
    
    // --- 4. MOBILE MENU TOGGLE ---
    if(menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
});
