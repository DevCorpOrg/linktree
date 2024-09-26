document.addEventListener('DOMContentLoaded', () => {
    const subscribeButton = document.querySelector('.subscribe-button');
    const shareButton = document.querySelector('.share-button');

    subscribeButton.addEventListener('click', handleSubscribe);
    shareButton.addEventListener('click', handleShare);
});

function handleSubscribe() {
    alert('Thanks for subscribing!');
}

function handleShare() {
    const pageUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Kit Baroness, DBA',
            url: pageUrl
        }).then(() => {
            console.log('Thanks for sharing!');
        }).catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(pageUrl).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
}