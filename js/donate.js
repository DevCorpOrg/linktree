document.addEventListener('DOMContentLoaded', () => {
    const donateButton = document.getElementById('donate-button');
    const cryptoSelect = document.getElementById('crypto-select');
    const amountInput = document.getElementById('amount-input');

    // Your Solana wallet address
    const walletAddress = 'CqgdDKDu9g9CgGHzB7vXYfSC2MBPg6UwfhSfa7khdtDf';

    donateButton.addEventListener('click', () => {
        const amount = amountInput.value;
        const crypto = cryptoSelect.value;
        
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        // SPL Token addresses (add more as needed)
        const tokenAddresses = {
            'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
            // Add more token addresses here
        };

        let donationLink;
        if (crypto === 'SOL') {
            donationLink = `solana:${walletAddress}?amount=${amount}&reference=OPTIONAL_REFERENCE&label=Donate%20to%20Project&message=Thank%20you%20for%20supporting%20this%20project!`;
        } else if (tokenAddresses[crypto]) {
            donationLink = `solana:${walletAddress}/transfer?asset=${tokenAddresses[crypto]}&amount=${amount}&reference=OPTIONAL_REFERENCE&label=Donate%20to%20Project&message=Thank%20you%20for%20supporting%20this%20project!`;
        } else {
            alert('Unsupported cryptocurrency selected');
            return;
        }

        window.open(donationLink, '_blank');
    });
});