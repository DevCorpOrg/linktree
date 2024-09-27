// carousel.js

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel-container');
    const items = document.querySelectorAll('.shop-item');
    const prevBtn = document.querySelector('.carousel-button.prev');
    const nextBtn = document.querySelector('.carousel-button.next');
    let currentIndex = 0;
    const itemCount = items.length;
    let currentIndex = 0;

    const firstItemClone = items[0].cloneNode(true);
    const lastItemClone = items[itemCount - 1].cloneNode(true);

    carousel.appendChild(firstItemClone);
    carousel.insertBefore(lastItemClone, items[0]);
    const totalItems = itemCount + 2; // 2 clones added

    function setCarouselPosition(index) {
        carousel.style.transform = `translateX(-${index * (100 / totalItems)}%)`;
    }

    function rotateCarousel() {
        currentIndex++;
    
        if (currentIndex >= totalItems) {
            // At the last clone, jump to the real first item
            carousel.style.transition = 'none'; // Disable transition for the jump
            currentIndex = 1; // Jump to the real first item
            setCarouselPosition(currentIndex); // Update position immediately
            setTimeout(() => {
                carousel.style.transition = 'transform 0.5s ease'; // Re-enable transition
            }, 0); // Ensure transition is reset after jump
        } else {
            carousel.style.transition = 'transform 0.5s ease'; // Set transition
            setCarouselPosition(currentIndex);
        }
    }
// Set the initial position to the first real item (since there's a clone at index 0)
setCarouselPosition(1);

// Start the carousel rotation every 3 seconds
setInterval(rotateCarousel, 3000);
});

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