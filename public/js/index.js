// Navigation and resize
document.addEventListener('DOMContentLoaded', () => {
    const navButton = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');

    function toggleNav() {
        if (!navList) return;
        navList.classList.toggle('hide');
    }

    function handleResize() {
        if (!navList) return;

        if (window.innerWidth > 1000) {
            navList.classList.remove('hide');
        } else {
            navList.classList.add('hide');
        }
    }

    if (navButton) {
        navButton.addEventListener('click', toggleNav);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    // Flash messages
    const flashes = document.querySelectorAll('.auto-dismiss');

    flashes.forEach((flash) => {
        const closeButton = flash.querySelector('.flash-close');

        const dismissFlash = () => {
            flash.classList.add('flash-hide');
            setTimeout(() => {
                flash.remove();
            }, 350);
        };

        if (closeButton) {
            closeButton.addEventListener('click', dismissFlash);
        }

        setTimeout(dismissFlash, 4000);
    });
});