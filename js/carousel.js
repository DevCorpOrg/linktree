// carousel.js

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel-container');
    const items = document.querySelectorAll('.shop-item');
    const prevBtn = document.querySelector('.carousel-button.prev');
    const nextBtn = document.querySelector('.carousel-button.next');
    let currentIndex = 0;

    function showItem(index) {
        carousel.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % items.length;
        showItem(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showItem(currentIndex);
    }

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoScroll();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoScroll();
    });

    let autoScrollInterval;

    function startAutoScroll() {
        autoScrollInterval = setInterval(nextSlide, 3000); // Change slide every 3 seconds
    }

    function resetAutoScroll() {
        clearInterval(autoScrollInterval);
        startAutoScroll();
    }

    startAutoScroll();
});