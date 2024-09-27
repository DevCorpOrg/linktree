// walletqr.js
document.addEventListener("DOMContentLoaded", () => {
    const bitcoinAddress = "bc1qk4vy0ksj327jcduyazuqzsvfrv7ww97q2f89ac";
    const ethereumAddress = "0xC261896e9c6a346653A1B227D84579B1EabEc46E";
    const solanaAddress = "CqgdDKDu9g9CgGHzB7vXYfSC2MBPg6UwfhSfa7khdtDf";

    document.getElementById("bitcoin-address").textContent = bitcoinAddress;
    document.getElementById("ethereum-address").textContent = ethereumAddress;
    document.getElementById("solana-address").textContent = solanaAddress;

    document.getElementById("bitcoin-qr").src = "https://raw.githubusercontent.com/DevCorpOrg/linktree/main/img/qr/btc.png";
    document.getElementById("ethereum-qr").src = "https://raw.githubusercontent.com/DevCorpOrg/linktree/main/img/qr/eth.png";
    document.getElementById("solana-qr").src = "https://raw.githubusercontent.com/DevCorpOrg/linktree/main/img/qr/sol.png"; 
});
