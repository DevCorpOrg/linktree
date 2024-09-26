// carousel.js
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel-container');
    const items = document.querySelectorAll('.shop-item');
    let currentIndex = 0;

    function rotateCarousel() {
        currentIndex = (currentIndex + 1) % items.length;
        carousel.style.transform = `translateX(-${currentIndex * 33.333}%)`;
    }

    // Rotate every 3 seconds
    setInterval(rotateCarousel, 3000);
});