/**
 * Visitor Location Map
 * 访问者位置地图统计
 */

class VisitorMap {
    constructor() {
        this.visitors = this.loadVisitors();
        this.mapContainer = null;
        this.currentVisitor = null;
        this.init();
    }

    // 初始化
    async init() {
        await this.getCurrentVisitor();
        this.saveCurrentVisitor();
        this.renderMap();
    }

    // 获取当前访问者信息
    async getCurrentVisitor() {
        try {
            // 获取IP地址
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const ip = ipData.ip;

            // 获取地理位置信息
            const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
            const geoData = await geoResponse.json();

            this.currentVisitor = {
                ip: ip,
                country: geoData.country_name || 'Unknown',
                countryCode: geoData.country_code || 'XX',
                region: geoData.region || 'Unknown',
                city: geoData.city || 'Unknown',
                latitude: geoData.latitude || 0,
                longitude: geoData.longitude || 0,
                timezone: geoData.timezone || 'Unknown',
                timestamp: new Date().toISOString()
            };

            console.log('Current visitor:', this.currentVisitor);
        } catch (error) {
            console.error('Error getting visitor info:', error);
            // 如果API调用失败，使用默认值
            this.currentVisitor = {
                ip: 'Unknown',
                country: 'Unknown',
                countryCode: 'XX',
                region: 'Unknown',
                city: 'Unknown',
                latitude: 0,
                longitude: 0,
                timezone: 'Unknown',
                timestamp: new Date().toISOString()
            };
        }
    }

    // 保存当前访问者信息
    saveCurrentVisitor() {
        if (!this.currentVisitor) return;

        // 检查是否已经记录过这个IP
        const existingVisitor = this.visitors.find(v => v.ip === this.currentVisitor.ip);
        if (!existingVisitor) {
            this.visitors.push(this.currentVisitor);
            this.saveVisitors();
        } else {
            // 更新访问时间
            existingVisitor.lastVisit = new Date().toISOString();
            this.saveVisitors();
        }
    }

    // 加载访问者数据
    loadVisitors() {
        const stored = localStorage.getItem('visitor-locations');
        return stored ? JSON.parse(stored) : [];
    }

    // 保存访问者数据
    saveVisitors() {
        localStorage.setItem('visitor-locations', JSON.stringify(this.visitors));
    }

    // 渲染地图
    renderMap() {
        const container = document.getElementById('visitor-map-container');
        if (!container) return;

        // 创建地图容器
        container.innerHTML = `
            <div class="visitor-stats">
                <h3>🌍 访问者统计 (Visitor Statistics)</h3>
                <div class="stats-summary">
                    <div class="stat-item">
                        <span class="stat-number">${this.visitors.length}</span>
                        <span class="stat-label">总访问者</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${this.getUniqueCountries().length}</span>
                        <span class="stat-label">国家/地区</span>
                    </div>
                </div>
                <div id="world-map" class="world-map"></div>
                <div class="visitor-list">
                    <h4>最近访问者 (Recent Visitors)</h4>
                    <div id="visitor-details" class="visitor-details"></div>
                </div>
            </div>
        `;

        this.renderWorldMap();
        this.renderVisitorList();
    }

    // 渲染世界地图
    renderWorldMap() {
        const mapDiv = document.getElementById('world-map');
        if (!mapDiv) return;

        // 使用简单的HTML/CSS地图显示
        const countryStats = this.getCountryStats();
        
        mapDiv.innerHTML = `
            <div class="map-visualization">
                <div class="map-legend">
                    <div class="legend-item">
                        <span class="legend-color high"></span>
                        <span>多次访问</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color medium"></span>
                        <span>有访问</span>
                    </div>
                </div>
                <div class="country-list">
                    ${Object.entries(countryStats).map(([country, count]) => `
                        <div class="country-item ${count > 1 ? 'high' : 'medium'}">
                            <span class="country-name">${country}</span>
                            <span class="country-count">${count} 次访问</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 渲染访问者列表
    renderVisitorList() {
        const detailsDiv = document.getElementById('visitor-details');
        if (!detailsDiv) return;

        const recentVisitors = this.visitors
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        detailsDiv.innerHTML = recentVisitors.map(visitor => `
            <div class="visitor-item">
                <div class="visitor-flag">${this.getCountryFlag(visitor.countryCode)}</div>
                <div class="visitor-info">
                    <div class="visitor-location">
                        ${visitor.city}, ${visitor.country}
                    </div>
                    <div class="visitor-time">
                        ${this.formatDate(visitor.timestamp)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 获取国家统计
    getCountryStats() {
        const stats = {};
        this.visitors.forEach(visitor => {
            stats[visitor.country] = (stats[visitor.country] || 0) + 1;
        });
        return stats;
    }

    // 获取唯一国家数
    getUniqueCountries() {
        return [...new Set(this.visitors.map(v => v.country))];
    }

    // 获取国家旗帜emoji (简化版)
    getCountryFlag(countryCode) {
        const flags = {
            'US': '🇺🇸', 'CN': '🇨🇳', 'JP': '🇯🇵', 'DE': '🇩🇪', 'GB': '🇬🇧',
            'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'CA': '🇨🇦', 'AU': '🇦🇺',
            'BR': '🇧🇷', 'IN': '🇮🇳', 'RU': '🇷🇺', 'KR': '🇰🇷', 'NL': '🇳🇱',
            'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'CH': '🇨🇭',
            'AT': '🇦🇹', 'BE': '🇧🇪', 'PT': '🇵🇹', 'IE': '🇮🇪', 'NZ': '🇳🇿',
            'SG': '🇸🇬', 'HK': '🇭🇰', 'TW': '🇹🇼', 'MX': '🇲🇽', 'AR': '🇦🇷'
        };
        return flags[countryCode] || '🌍';
    }

    // 格式化日期
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`;
        
        return date.toLocaleDateString();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在主页
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        setTimeout(() => {
            new VisitorMap();
        }, 1000);
    }
}); 