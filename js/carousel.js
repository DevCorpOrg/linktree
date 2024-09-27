document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel-container');
    const items = document.querySelectorAll('.shop-item');
    const itemCount = items.length;
    let currentIndex = 0;

    // Clone first three and last three items (or fewer if less than 3 items)
    const itemsToClone = Math.min(3, itemCount);
    for (let i = 0; i < itemsToClone; i++) {
        const firstClone = items[i].cloneNode(true);
        const lastClone = items[itemCount - 1 - i].cloneNode(true);
        carousel.appendChild(firstClone);
        carousel.insertBefore(lastClone, items[0]);
    }

    const totalItems = itemCount + (itemsToClone * 2);

    function setCarouselPosition(index) {
        carousel.style.transform = `translateX(-${index * (100 / 3)}%)`;
    }

    function rotateCarousel() {
        currentIndex++;
        carousel.style.transition = 'transform 0.5s ease';
        setCarouselPosition(currentIndex);

        if (currentIndex >= itemCount) {
            setTimeout(() => {
                carousel.style.transition = 'none';
                currentIndex = 0;
                setCarouselPosition(currentIndex);
            }, 500); // Wait for transition to finish
        }
    }

    // Set initial position
    setCarouselPosition(0);

    // Start automatic rotation
    setInterval(rotateCarousel, 3000);
});