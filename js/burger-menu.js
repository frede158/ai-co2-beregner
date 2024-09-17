document.addEventListener('DOMContentLoaded', function() {
    const burgerIcon = document.querySelector('.burger-icon');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');

    if (burgerIcon && mobileMenu && closeMenu) {
        burgerIcon.addEventListener('click', function() {
            mobileMenu.classList.add('active');
        });

        closeMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    }
});
