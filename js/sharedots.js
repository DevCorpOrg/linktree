// sharedots.js

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.share-dots').forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const link = e.target.closest('.button').getAttribute('href');
            shareLink(link, e.target);
        });
    });
});

function shareLink(link, target) {
    // First, try to use the Web Share API
    if (navigator.share) {
        navigator.share({
            title: 'Check out this link',
            url: link
        }).then(() => {
            console.log('Thanks for sharing!');
        }).catch(error => {
            console.error('Error sharing:', error);
            fallbackShare(link, target);
        });
    } else {
        // If Web Share API is not supported, use the fallback
        fallbackShare(link, target);
    }
}

function fallbackShare(link, target) {
    // Copy to clipboard
    navigator.clipboard.writeText(link).then(() => {
        alert('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });

    // Show custom share menu
    showShareMenu(link, target);
}

function showShareMenu(link, target) {
    // Remove any existing share menu
    const existingMenu = document.querySelector('.share-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.className = 'share-menu';
    menu.innerHTML = `
        <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}" target="_blank">Share on Twitter</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}" target="_blank">Share on Facebook</a>
        <a href="https://www.linkedin.com/shareArticle?url=${encodeURIComponent(link)}" target="_blank">Share on LinkedIn</a>
    `;

    // Position the menu near the clicked dots
    const rect = target.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;

    // Add the menu to the DOM
    document.body.appendChild(menu);

    // Close the menu when clicking outside
    document.addEventListener('click', closeShareMenu);
}

function closeShareMenu(e) {
    const menu = document.querySelector('.share-menu');
    if (menu && !menu.contains(e.target) && !e.target.classList.contains('share-dots')) {
        menu.remove();
        document.removeEventListener('click', closeShareMenu);
    }
}