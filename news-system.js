// Advanced TradingView Dashboard
class TradingViewDashboard {
    constructor() {
        this.currentSymbol = 'BINANCE:BTCUSDT';
        this.currentTimeframe = '1H';
        this.cryptoPrices = {};
        this.init();
    }

    init() {
        this.loadCryptoPrices();
        this.initTradingViewChart();
        this.setupSymbolSelector();
        this.setupTimeframeSelector();
        this.setupPortfolioData();
        
        // Auto-refresh prices every 10 seconds
        setInterval(() => this.loadCryptoPrices(), 10000);
    }

    // Load live crypto prices from CoinGecko API
    async loadCryptoPrices() {
        try {
            const cryptocurrencies = [
                { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
                { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
                { id: 'solana', symbol: 'SOL', name: 'Solana' },
                { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin' },
                { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
                { id: 'ripple', symbol: 'XRP', name: 'XRP' },
                { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
                { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' }
            ];

            const ids = cryptocurrencies.map(crypto => crypto.id).join(',');
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
            );
            const data = await response.json();

            this.cryptoPrices = data;
            this.displayCryptoPrices(cryptocurrencies);
        } catch (error) {
            console.error('Error fetching crypto prices:', error);
            this.displayError('Failed to load prices');
        }
    }

    displayCryptoPrices(cryptos) {
        const grid = document.getElementById('cryptoGrid');
        
        grid.innerHTML = cryptos.map(crypto => {
            const priceData = this.cryptoPrices[crypto.id];
            if (!priceData) return '';

            const price = priceData.usd;
            const change = priceData.usd_24h_change;
            const changeColor = change >= 0 ? 'price-up' : 'price-down';
            const changeSymbol = change >= 0 ? '↗' : '↘';

            return `
                <div class="crypto-card" onclick="dashboard.setSymbol('BINANCE:${crypto.symbol}USDT')">
                    <div class="crypto-symbol">${crypto.symbol}</div>
                    <div class="crypto-name">${crypto.name}</div>
                    <div class="crypto-price ${changeColor}">$${this.formatPrice(price)}</div>
                    <div class="crypto-change ${changeColor}">
                        ${changeSymbol} ${change ? Math.abs(change).toFixed(2) + '%' : 'N/A'}
                    </div>
                </div>
            `;
        }).join('');
    }

    formatPrice(price) {
        if (price >= 1000) {
            return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
        } else if (price >= 1) {
            return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
        } else {
            return price.toLocaleString('en-US', { maximumFractionDigits: 4 });
        }
    }

    // Initialize TradingView Widget
    initTradingViewChart() {
        new TradingView.widget({
            container_id: "tradingview_chart",
            width: "100%",
            height: "100%",
            symbol: this.currentSymbol,
            interval: this.currentTimeframe,
            timezone: "Asia/Kolkata",
            theme: "dark",
            style: "1",
            locale: "in",
            toolbar_bg: "#0c0c0c",
            enable_publishing: false,
            allow_symbol_change: true,
            hide_side_toolbar: false,
            studies: [
                "RSI@tv-basicstudies",
                "MACD@tv-basicstudies",
                "Volume@tv-basicstudies"
            ],
            show_popup_button: true,
            popup_width: "1000",
            popup_height: "650",
            details: true,
            hotlist: true,
            calendar: true,
            news: [
                "headlines"
            ]
        });
    }

    setupSymbolSelector() {
        const symbols = [
            { symbol: 'BINANCE:BTCUSDT', name: 'BTC/USDT' },
            { symbol: 'BINANCE:ETHUSDT', name: 'ETH/USDT' },
            { symbol: 'BINANCE:SOLUSDT', name: 'SOL/USDT' },
            { symbol: 'BINANCE:BNBUSDT', name: 'BNB/USDT' },
            { symbol: 'BINANCE:DOGEUSDT', name: 'DOGE/USDT' },
            { symbol: 'BINANCE:XRPUSDT', name: 'XRP/USDT' },
            { symbol: 'BINANCE:ADAUSDT', name: 'ADA/USDT' },
            { symbol: 'BINANCE:DOTUSDT', name: 'DOT/USDT' }
        ];

        const selector = document.getElementById('symbolSelector');
        selector.innerHTML = symbols.map(sym => `
            <button class="symbol-btn ${sym.symbol === this.currentSymbol ? 'active' : ''}" 
                    onclick="dashboard.setSymbol('${sym.symbol}')">
                ${sym.name}
            </button>
        `).join('');
    }

    setupTimeframeSelector() {
        const timeframes = [
            { value: '1', label: '1m' },
            { value: '5', label: '5m' },
            { value: '15', label: '15m' },
            { value: '30', label: '30m' },
            { value: '60', label: '1H' },
            { value: '240', label: '4H' },
            { value: '1D', label: '1D' },
            { value: '1W', label: '1W' }
        ];

        const selector = document.getElementById('timeframeSelector');
        selector.innerHTML = timeframes.map(tf => `
            <button class="timeframe-btn ${tf.value === this.currentTimeframe ? 'active' : ''}" 
                    onclick="dashboard.setTimeframe('${tf.value}')">
                ${tf.label}
            </button>
        `).join('');
    }

    setSymbol(symbol) {
        this.currentSymbol = symbol;
        
        // Update active button
        document.querySelectorAll('.symbol-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Reload chart with new symbol
        this.reloadChart();
    }

    setTimeframe(timeframe) {
        this.currentTimeframe = timeframe;
        
        // Update active button
        document.querySelectorAll('.timeframe-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Reload chart with new timeframe
        this.reloadChart();
    }

    reloadChart() {
        // Remove existing chart
        const chartContainer = document.getElementById('tradingview_chart');
        chartContainer.innerHTML = '';
        
        // Reinitialize chart
        this.initTradingViewChart();
    }

    setupPortfolioData() {
        // Simulate live portfolio updates
        setInterval(() => {
            this.updatePortfolioValues();
        }, 5000);
    }

    updatePortfolioValues() {
        // Simulate price fluctuations
        const fluctuation = (Math.random() - 0.5) * 100;
        const currentBalance = 21683.55 + fluctuation;
        
        document.getElementById('totalBalance').textContent = `$${currentBalance.toFixed(2)}`;
        document.getElementById('totalPnL').textContent = `+$${(currentBalance - 10000).toFixed(2)}`;
        
        // Update P&L color based on value
        const pnlElement = document.getElementById('totalPnL');
        if (currentBalance - 10000 >= 0) {
            pnlElement.className = 'portfolio-value price-up';
        } else {
            pnlElement.className = 'portfolio-value price-down';
        }
    }

    displayError(message) {
        const grid = document.getElementById('cryptoGrid');
        grid.innerHTML = `<div class="crypto-card" style="grid-column: 1/-1; text-align: center; color: #ff4444;">
            ${message}
        </div>`;
    }
}

// Alternative Method: TradingView Ticker Tape
function loadTickerTape() {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "symbols": [
            { "proName": "BINANCE:BTCUSDT", "title": "Bitcoin" },
            { "proName": "BINANCE:ETHUSDT", "title": "Ethereum" },
            { "proName": "BINANCE:SOLUSDT", "title": "Solana" },
            { "proName": "BINANCE:BNBUSDT", "title": "Binance Coin" },
            { "proName": "BINANCE:XRPUSDT", "title": "XRP" },
            { "proName": "BINANCE:ADAUSDT", "title": "Cardano" },
            { "proName": "BINANCE:DOTUSDT", "title": "Polkadot" }
        ],
        "showSymbolLogo": true,
        "colorTheme": "dark",
        "isTransparent": true,
        "displayMode": "adaptive",
        "locale": "in"
    });
    
    document.getElementById('ticker-tape-container').appendChild(script);
}

// Alternative Method: Mini Charts
function loadMiniCharts() {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "400",
        "defaultColumn": "overview",
        "screener_type": "crypto_mkt",
        "displayCurrency": "USD",
        "colorTheme": "dark",
        "locale": "in"
    });
    
    document.getElementById('mini-charts-container').appendChild(script);
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new TradingViewDashboard();
    
    // Load additional widgets after main chart
    setTimeout(() => {
        loadTickerTape();
        loadMiniCharts();
    }, 2000);
});

// Global functions for HTML onclick
function setSymbol(symbol) {
    dashboard.setSymbol(symbol);
}

function setTimeframe(timeframe) {
    dashboard.setTimeframe(timeframe);
}
