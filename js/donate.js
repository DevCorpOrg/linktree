document.addEventListener('DOMContentLoaded', () => {
    const donateButton = document.getElementById('donate-button');
    const modal = document.getElementById('donate-modal');
    const closeButton = document.getElementsByClassName('close')[0];
    const confirmButton = document.getElementById('confirm-donate');
    const cryptoSelect = document.getElementById('crypto-select');
    const amountInput = document.getElementById('amount-input');
    const equivalentValue = document.getElementById('equivalent-value');

    const walletAddresses = {
        'SOL': 'CqgdDKDu9g9CgGHzB7vXYfSC2MBPg6UwfhSfa7khdtDf',
        'ETH': '0xC261896e9c6a346653A1B227D84579B1EabEc46E',
        'MATIC': '0xC261896e9c6a346653A1B227D84579B1EabEc46E',
        'BTC': 'bc1qk4vy0ksj327jcduyazuqzsvfrv7ww97q2f89ac'
    };

    const tokenAddresses = {
        'USDC-SOL': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'USDC-ETH': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        'USDC-MATIC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        'MMOSH-SOL': 'FwfrwnNVLGyS8ucVjWvyoRdFDpTY8w6ACMAxJ4rqGUSS'
    };

    let exchangeRates = {};

    async function fetchExchangeRates() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum,matic-network,bitcoin,usd-coin&vs_currencies=usd');
            const data = await response.json();
            
            exchangeRates = {
                'SOL': data.solana.usd,
                'ETH': data.ethereum.usd,
                'MATIC': data['matic-network'].usd,
                'BTC': data.bitcoin.usd,
                'USDC': data['usd-coin'].usd
            };

            const mmoshPrice = await fetchMMOSHPrice();
            exchangeRates['MMOSH'] = mmoshPrice ?? 0.00035;

            updateEquivalentValue();
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            equivalentValue.textContent = 'Unable to fetch current exchange rates';
        }
    }

    async function fetchMMOSHPrice() {
        try {
            const response = await fetch('https://api.geckoterminal.com/api/v2/tokens/solana/FwfrwnNVLGyS8ucVjWvyoRdFDpTY8w6ACMAxJ4rqGUSS', {
                headers: { 'Accept': 'application/json;version=20230302' }
            });
            const data = await response.json();
            return parseFloat(data.data.attributes.price_usd);
        } catch (error) {
            console.error('Failed to fetch MMOSH price:', error);
            return null;
        }
    }

    function updateEquivalentValue() {
        const amount = parseFloat(amountInput.value);
        const [crypto] = cryptoSelect.value.split('-');
        if (amount && !isNaN(amount) && amount > 0 && exchangeRates[crypto]) {
            const usdValue = amount * exchangeRates[crypto];
            equivalentValue.textContent = `Equivalent to approximately $${usdValue.toFixed(2)} USD (1 ${crypto} = $${exchangeRates[crypto].toFixed(6)} USD)`;
        } else {
            equivalentValue.textContent = '';
        }
    }

    fetchExchangeRates();
    setInterval(fetchExchangeRates, 60000); // Fetch rates every minute

    amountInput.addEventListener('input', updateEquivalentValue);
    cryptoSelect.addEventListener('change', updateEquivalentValue);

    donateButton.onclick = () => {
        modal.style.display = 'block';
    }

    closeButton.onclick = () => {
        modal.style.display = 'none';
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    confirmButton.onclick = () => {
        const amount = amountInput.value;
        const crypto = cryptoSelect.value;
        
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        let donationLink;
        if (crypto === 'SOL') {
            donationLink = `solana:${solanaAddress}?amount=${amount}&reference=OPTIONAL_REFERENCE&label=Donate%20to%20Project&message=Thank%20you%20for%20supporting%20this%20project!`;
        } else if (crypto === 'USDC') {
            donationLink = `solana:${solanaAddress}/transfer?asset=${usdcAddress}&amount=${amount}&reference=OPTIONAL_REFERENCE&label=Donate%20to%20Project&message=Thank%20you%20for%20supporting%20this%20project!`;
        }

        window.open(donationLink, '_blank');
        modal.style.display = 'none';
    }

    donateButton.addEventListener('click', () => {
        const amount = amountInput.value;
        const [crypto, blockchain] = cryptoSelect.value.split('-');
        
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        let donationLink;
        if (!walletAddresses[blockchain]) {
            alert('Unsupported blockchain selected');
            return;
        }

        switch(blockchain) {
            case 'SOL':
                if (crypto === 'SOL') {
                    donationLink = `solana:${walletAddresses.SOL}?amount=${amount}`;
                } else if (tokenAddresses[`${crypto}-SOL`]) {
                    donationLink = `solana:${walletAddresses.SOL}/transfer?asset=${tokenAddresses[`${crypto}-SOL`]}&amount=${amount}`;
                } else {
                    alert('Unsupported cryptocurrency for SOL selected');
                    return;
                }
                break;
            case 'ETH':
                if (crypto === 'USDC') {
                    donationLink = `ethereum:${tokenAddresses['USDC-ETH']}/transfer?address=${walletAddresses.ETH}&uint256=${amount * 1e6}`;
                } else if (crypto === 'ETH') {
                    donationLink = `ethereum:${walletAddresses.ETH}?value=${Web3.utils.toWei(amount, 'ether')}`;
                } else {
                    alert('Unsupported cryptocurrency for ETH selected');
                    return;
                }
                break;
            case 'MATIC':
                if (crypto === 'USDC') {
                    donationLink = `ethereum:${tokenAddresses['USDC-MATIC']}/transfer?address=${walletAddresses.MATIC}&uint256=${amount * 1e6}&chainId=137`;
                } else if (crypto === 'MATIC') {
                    donationLink = `ethereum:${walletAddresses.MATIC}?value=${Web3.utils.toWei(amount, 'ether')}&chainId=137`;
                } else {
                    alert('Unsupported cryptocurrency for MATIC selected');
                    return;
                }
                break;
            case 'BTC':
                if (crypto === 'BTC') {
                    donationLink = `bitcoin:${walletAddresses.BTC}?amount=${amount}`;
                } else {
                    alert('Unsupported cryptocurrency for BTC selected');
                    return;
                }
                break;
            default:
                alert('Unsupported blockchain selected');
                return;
        }

        window.location.href = donationLink;
    });
});
