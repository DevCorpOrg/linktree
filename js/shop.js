document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-button');
    const linksContainer = document.querySelector('.button-container');
    const shopContainer = document.querySelector('.shop-grid');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            if (button.dataset.view === 'shop') {
                linksContainer.style.display = 'none';
                shopContainer.style.display = 'grid';
            } else {
                linksContainer.style.display = 'block';
                shopContainer.style.display = 'none';
            }
        });
    });
});