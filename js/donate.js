document.addEventListener('DOMContentLoaded', () => {
    const donateButton = document.getElementById('donate-button');
    const cryptoSelect = document.getElementById('crypto-select');
    const amountInput = document.getElementById('amount-input');
    const equivalentValue = document.getElementById('equivalent-value');
    const displayCurrency = document.getElementById('display-currency');
    const fallbackOptions = document.getElementById('fallback-options');
    const walletAddressInput = document.getElementById('wallet-address');
    const copyAddressButton = document.getElementById('copy-address');
    const qrCodeDiv = document.getElementById('qr-code');

    const walletAddresses = {
        'SOL': 'CqgdDKDu9g9CgGHzB7vXYfSC2MBPg6UwfhSfa7khdtDf',
        'ETH': '0xC261896e9c6a346653A1B227D84579B1EabEc46E',
        'ETH-USDC': '0xC261896e9c6a346653A1B227D84579B1EabEc46E',
        'MATIC': '0xC261896e9c6a346653A1B227D84579B1EabEc46E',
        'SOL-USDC': 'CqgdDKDu9g9CgGHzB7vXYfSC2MBPg6UwfhSfa7khdtDf',
        'SOL-MMOSH': '0xC261896e9c6a346653A1B227D84579B1EabEc46E',
        'MATIC-USDC': '0xC261896e9c6a346653A1B227D84579B1EabEc46E',
        'BTC': 'bc1qk4vy0ksj327jcduyazuqzsvfrv7ww97q2f89ac'
    };

    const tokenAddresses = {
        'USDC-SOL': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'USDC-ETH': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        'USDC-MATIC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        'MMOSH-SOL': 'FwfrwnNVLGyS8ucVjWvyoRdFDpTY8w6ACMAxJ4rqGUSS'
    };

    let exchangeRates = {};
    let fiatRates = {};

    async function fetchExchangeRates() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum,matic-network,bitcoin,usd-coin&vs_currencies=usd,eur,gbp,jpy');
            const data = await response.json();
            
            exchangeRates = {
                'SOL': data.solana,
                'ETH': data.ethereum,
                'MATIC': data['matic-network'],
                'BTC': data.bitcoin,
                'USDC': data['usd-coin']
            };

            fiatRates = {
                'USD': 1,
                'EUR': data.bitcoin.eur / data.bitcoin.usd,
                'GBP': data.bitcoin.gbp / data.bitcoin.usd,
                'JPY': data.bitcoin.jpy / data.bitcoin.usd
            };

            const mmoshPrice = await fetchMMOSHPrice();
            exchangeRates['MMOSH'] = { usd: mmoshPrice ?? 0.00036 };

            updateEquivalentValue();
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            equivalentValue.value = 'Unable to fetch current exchange rates';
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
        const currency = displayCurrency.value;
        
        if (amount && !isNaN(amount) && amount > 0 && exchangeRates[crypto] && fiatRates[currency]) {
            const usdValue = amount * exchangeRates[crypto].usd;
            const displayValue = usdValue * fiatRates[currency];
            equivalentValue.value = `${displayValue.toFixed(2)} ${currency}`;
        } else {
            equivalentValue.value = '';
        }
    }

    function showFallbackOptions() {
        fallbackOptions.style.display = 'block';
        updateQRCode();
    }

    function updateQRCode() {
        const [crypto, blockchain] = cryptoSelect.value.split('-');
        const address = blockchain ? tokenAddresses[`${crypto}-${blockchain}`] : walletAddresses[crypto];
        const amount = amountInput.value;

        walletAddressInput.value = address;

        let qrContent = address;
        if (amount && !isNaN(amount) && amount > 0) {
            if (blockchain === 'BTC') {
                qrContent = `bitcoin:${address}?amount=${amount}`;
            } else if (blockchain === 'ETH' || blockchain === 'MATIC') {
                qrContent = `ethereum:${address}@${blockchain === 'MATIC' ? '137' : '1'}?value=${Web3.utils.toWei(amount, 'ether')}`;
            } else if (blockchain === 'SOL') {
                qrContent = `solana:${address}?amount=${amount}`;
            }
        }

        qrCodeDiv.innerHTML = '';
        new QRCode(qrCodeDiv, {
            text: qrContent,
            width: 180,
            height: 180
        });
    }

    fetchExchangeRates();
    setInterval(fetchExchangeRates, 60000); // Fetch rates every minute

    amountInput.addEventListener('input', updateEquivalentValue);
    cryptoSelect.addEventListener('change', () => {
        updateEquivalentValue();
        updateQRCode();
    });
    displayCurrency.addEventListener('change', updateEquivalentValue);

    donateButton.addEventListener('click', async () => {
        const amount = amountInput.value;
        const [crypto, blockchain] = cryptoSelect.value.split('-');
        
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        let succeeded = false;

        switch(blockchain || crypto) {
            case 'SOL':
                if (window.solana && window.solana.isPhantom) {
                    try {
                        await window.solana.connect();
                        let transaction;
                        if (crypto === 'SOL') {
                            transaction = new solanaWeb3.Transaction().add(
                                solanaWeb3.SystemProgram.transfer({
                                    fromPubkey: window.solana.publicKey,
                                    toPubkey: new solanaWeb3.PublicKey(walletAddresses.SOL),
                                    lamports: solanaWeb3.LAMPORTS_PER_SOL * amount
                                })
                            );
                        } else if (crypto === 'USDC' || crypto === 'MMOSH') {
                            const tokenMintAddress = tokenAddresses[`${crypto}-SOL`];
                            const tokenProgramId = new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
                            const fromTokenAccount = await solanaWeb3.PublicKey.findProgramAddress(
                                [window.solana.publicKey.toBuffer(), tokenProgramId.toBuffer(), new solanaWeb3.PublicKey(tokenMintAddress).toBuffer()],
                                new solanaWeb3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
                            );
                            const toTokenAccount = await solanaWeb3.PublicKey.findProgramAddress(
                                [new solanaWeb3.PublicKey(walletAddresses.SOL).toBuffer(), tokenProgramId.toBuffer(), new solanaWeb3.PublicKey(tokenMintAddress).toBuffer()],
                                new solanaWeb3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
                            );
                            transaction = new solanaWeb3.Transaction().add(
                                solanaWeb3.Token.createTransferInstruction(
                                    tokenProgramId,
                                    fromTokenAccount[0],
                                    toTokenAccount[0],
                                    window.solana.publicKey,
                                    [],
                                    amount * (crypto === 'USDC' ? 1e6 : 1e9) 
                                )
                            );
                        }
                        const signature = await window.solana.signAndSendTransaction(transaction);
                        console.log('Transaction sent:', signature);
                        succeeded = true;
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
                break;
            case 'ETH':
            case 'MATIC':
                if (window.ethereum) {
                    try {
                        await window.ethereum.request({ method: 'eth_requestAccounts' });
                        const web3 = new Web3(window.ethereum);
                        const accounts = await web3.eth.getAccounts();
                        if (crypto === 'USDC') {
                            const tokenContract = new web3.eth.Contract([
                                {
                                    "constant": false,
                                    "inputs": [
                                        {"name": "_to", "type": "address"},
                                        {"name": "_value", "type": "uint256"}
                                    ],
                                    "name": "transfer",
                                    "outputs": [{"name": "", "type": "bool"}],
                                    "type": "function"
                                }
                            ], tokenAddresses[`USDC-${blockchain}`]);
                            await tokenContract.methods.transfer(walletAddresses[blockchain], web3.utils.toWei(amount, 'mwei')).send({from: accounts[0]});
                        } else {
                            await web3.eth.sendTransaction({
                                from: accounts[0],
                                to: walletAddresses[blockchain],
                                value: web3.utils.toWei(amount, 'ether')
                            });
                        }
                        succeeded = true;
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
                break;
            default:
                // For other tokens or unsupported direct wallet interactions
                break;
        }

        if (!succeeded) {
            let donationLink;
            if (blockchain === 'SOL') {
                if (crypto === 'SOL') {
                    donationLink = `solana:${walletAddresses.SOL}?amount=${amount}`;
                } else if (tokenAddresses[`${crypto}-SOL`]) {
                    donationLink = `solana:${walletAddresses.SOL}/transfer?asset=${tokenAddresses[`${crypto}-SOL`]}&amount=${amount}`;
                }
            } else if (blockchain === 'ETH' || blockchain === 'MATIC') {
                if (crypto === 'USDC') {
                    donationLink = `ethereum:${tokenAddresses[`USDC-${blockchain}`]}/transfer?address=${walletAddresses[blockchain]}&uint256=${amount * 1e6}${blockchain === 'MATIC' ? '&chainId=137' : ''}`;
                } else {
                    donationLink = `ethereum:${walletAddresses[blockchain]}?value=${Web3.utils.toWei(amount, 'ether')}${blockchain === 'MATIC' ? '&chainId=137' : ''}`;
                }
            } else if (blockchain === 'BTC') {
                donationLink = `bitcoin:${walletAddresses.BTC}?amount=${amount}`;
            }

            if (donationLink) {
                window.location.href = donationLink;
            } else {
                showFallbackOptions();
            }
        }
    });

    async function detectWallet() {
        if (window.solana && window.solana.isPhantom) {
            return { name: 'Phantom', type: 'solana', provider: window.solana };
        } else if (window.solflare) {
            return { name: 'Solflare', type: 'solana', provider: window.solflare };
        } else if (window.ethereum) {
            if (window.ethereum.isCoinbaseWallet) {
                return { name: 'Coinbase', type: 'ethereum', provider: window.ethereum };
            } else if (window.ethereum.isBraveWallet) {
                return { name: 'Brave', type: 'ethereum', provider: window.ethereum };
            } else if (window.ethereum.isMetaMask) {
                return { name: 'MetaMask', type: 'ethereum', provider: window.ethereum };
            } else if (window.ethereum.isOpera) {
                return { name: 'Opera', type: 'ethereum', provider: window.ethereum };
            } else {
                return { name: 'Unknown Ethereum', type: 'ethereum', provider: window.ethereum };
            }
        }
        return null;
    }

    async function connectWallet(wallet) {
        if (wallet.type === 'solana') {
            await wallet.provider.connect();
            return wallet.provider.publicKey.toString();
        } else if (wallet.type === 'ethereum') {
            const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });
            return accounts[0];
        }
    }

    async function sendTransaction(wallet, transaction) {
        if (wallet.type === 'solana') {
            const { signature } = await wallet.provider.signAndSendTransaction(transaction);
            return signature;
        } else if (wallet.type === 'ethereum') {
            const web3 = new Web3(wallet.provider);
            return await web3.eth.sendTransaction(transaction);
        }
    }

    donateButton.addEventListener('click', async () => {
        const amount = amountInput.value;
        const [crypto, blockchain] = cryptoSelect.value.split('-');
        
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const wallet = await detectWallet();
        if (!wallet) {
            showFallbackOptions();
            return;
        }

        try {
            const account = await connectWallet(wallet);
            let transaction;

            if (wallet.type === 'solana' && (blockchain === 'SOL' || !blockchain)) {
                const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'));
                if (crypto === 'SOL') {
                    transaction = new solanaWeb3.Transaction().add(
                        solanaWeb3.SystemProgram.transfer({
                            fromPubkey: new solanaWeb3.PublicKey(account),
                            toPubkey: new solanaWeb3.PublicKey(walletAddresses.SOL),
                            lamports: solanaWeb3.LAMPORTS_PER_SOL * amount
                        })
                    );
                } else if (crypto === 'USDC' || crypto === 'MMOSH') {
                    const tokenMintAddress = tokenAddresses[`${crypto}-SOL`];
                    const tokenProgramId = new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
                    const fromTokenAccount = await solanaWeb3.PublicKey.findProgramAddress(
                        [new solanaWeb3.PublicKey(account).toBuffer(), tokenProgramId.toBuffer(), new solanaWeb3.PublicKey(tokenMintAddress).toBuffer()],
                        new solanaWeb3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
                    );
                    const toTokenAccount = await solanaWeb3.PublicKey.findProgramAddress(
                        [new solanaWeb3.PublicKey(walletAddresses.SOL).toBuffer(), tokenProgramId.toBuffer(), new solanaWeb3.PublicKey(tokenMintAddress).toBuffer()],
                        new solanaWeb3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
                    );
                    transaction = new solanaWeb3.Transaction().add(
                        solanaWeb3.Token.createTransferInstruction(
                            tokenProgramId,
                            fromTokenAccount[0],
                            toTokenAccount[0],
                            new solanaWeb3.PublicKey(account),
                            [],
                            amount * (crypto === 'USDC' ? 1e6 : 1e9) // USDC has 6 decimals, MMOSH has 9
                        )
                    );
                }
            } else if (wallet.type === 'ethereum' && (blockchain === 'ETH' || blockchain === 'MATIC' || !blockchain)) {
                const web3 = new Web3(wallet.provider);
                if (crypto === 'ETH' || crypto === 'MATIC') {
                    transaction = {
                        from: account,
                        to: walletAddresses[blockchain || 'ETH'],
                        value: web3.utils.toWei(amount, 'ether'),
                        chainId: blockchain === 'MATIC' ? 137 : undefined
                    };
                } else if (crypto === 'USDC') {
                    const tokenContract = new web3.eth.Contract([
                        {
                            "constant": false,
                            "inputs": [
                                {"name": "_to", "type": "address"},
                                {"name": "_value", "type": "uint256"}
                            ],
                            "name": "transfer",
                            "outputs": [{"name": "", "type": "bool"}],
                            "type": "function"
                        }
                    ], tokenAddresses[`USDC-${blockchain || 'ETH'}`]);
                    transaction = tokenContract.methods.transfer(walletAddresses[blockchain || 'ETH'], web3.utils.toWei(amount, 'mwei')).encodeABI();
                }
            }

            if (transaction) {
                const result = await sendTransaction(wallet, transaction);
                console.log('Transaction sent:', result);
                alert('Transaction sent successfully!');
            } else {
                throw new Error('Unsupported cryptocurrency or blockchain for the detected wallet');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Transaction failed. Please try again or use the fallback options.');
            showFallbackOptions();
        }
    });

    copyAddressButton.addEventListener('click', () => {
        walletAddressInput.select();
        document.execCommand('copy');
        alert('Address copied to clipboard!');
    });

    // Initial updates
    updateEquivalentValue();
    updateQRCode();
});