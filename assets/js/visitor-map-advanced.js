/**
 * Advanced Visitor Location Map with D3.js
 * 高级访问者位置地图（使用D3.js）
 */

class AdvancedVisitorMap {
    constructor() {
        this.visitors = this.loadVisitors();
        this.mapContainer = null;
        this.currentVisitor = null;
        this.svg = null;
        this.projection = null;
        this.path = null;
        this.width = 800;
        this.height = 400;
        this.init();
    }

    // 初始化
    async init() {
        await this.getCurrentVisitor();
        this.saveCurrentVisitor();
        await this.loadD3();
        this.renderMap();
    }

    // 动态加载D3.js库
    async loadD3() {
        return new Promise((resolve, reject) => {
            if (window.d3) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://d3js.org/d3.v7.min.js';
            script.onload = () => {
                const topoScript = document.createElement('script');
                topoScript.src = 'https://unpkg.com/topojson@3';
                topoScript.onload = () => resolve();
                topoScript.onerror = () => reject(new Error('Failed to load TopoJSON'));
                document.head.appendChild(topoScript);
            };
            script.onerror = () => reject(new Error('Failed to load D3.js'));
            document.head.appendChild(script);
        });
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
                latitude: parseFloat(geoData.latitude) || 0,
                longitude: parseFloat(geoData.longitude) || 0,
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
    async renderMap() {
        const container = document.getElementById('visitor-map-container');
        if (!container) return;

        // 创建地图容器
        container.innerHTML = `
            <div class="visitor-stats-advanced">
                <h3>🌍 全球访问者分布 (Global Visitor Distribution)</h3>
                <div class="stats-summary">
                    <div class="stat-item">
                        <span class="stat-number">${this.visitors.length}</span>
                        <span class="stat-label">总访问者</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${this.getUniqueCountries().length}</span>
                        <span class="stat-label">国家/地区</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${this.getValidCoordinates().length}</span>
                        <span class="stat-label">有效位置</span>
                    </div>
                </div>
                <div id="world-map-svg" class="world-map-svg"></div>
                <div class="visitor-list-advanced">
                    <h4>最近访问者 (Recent Visitors)</h4>
                    <div id="visitor-details-advanced" class="visitor-details-advanced"></div>
                </div>
            </div>
        `;

        await this.renderD3Map();
        this.renderVisitorList();
    }

    // 渲染D3世界地图
    async renderD3Map() {
        const mapDiv = document.getElementById('world-map-svg');
        if (!mapDiv || !window.d3) {
            console.log('D3.js not available, falling back to simple map');
            this.renderSimpleMap();
            return;
        }

        // 清空容器
        mapDiv.innerHTML = '';

        // 设置SVG尺寸
        const containerWidth = mapDiv.offsetWidth;
        this.width = Math.min(containerWidth, 800);
        this.height = this.width * 0.5;

        // 创建SVG
        this.svg = d3.select('#world-map-svg')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('background', '#f8f9fa');

        // 设置投影
        this.projection = d3.geoNaturalEarth1()
            .scale(this.width / 6.5)
            .translate([this.width / 2, this.height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        try {
            // 加载世界地图数据
            const world = await d3.json('https://unpkg.com/world-atlas@3/world-110m.json');
            
            // 绘制国家
            this.svg.append('g')
                .selectAll('path')
                .data(topojson.feature(world, world.objects.countries).features)
                .enter().append('path')
                .attr('d', this.path)
                .attr('fill', '#e0e0e0')
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.5);

            // 添加访问者点
            this.addVisitorPoints();
            
        } catch (error) {
            console.error('Error loading world map:', error);
            this.renderSimpleMap();
        }
    }

    // 添加访问者位置点
    addVisitorPoints() {
        const validVisitors = this.getValidCoordinates();
        
        // 创建访问者点
        const points = this.svg.append('g')
            .selectAll('circle')
            .data(validVisitors)
            .enter().append('circle')
            .attr('cx', d => this.projection([d.longitude, d.latitude])[0])
            .attr('cy', d => this.projection([d.longitude, d.latitude])[1])
            .attr('r', 0)
            .attr('fill', '#ff6b6b')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8);

        // 添加动画
        points.transition()
            .duration(1000)
            .delay((d, i) => i * 200)
            .attr('r', 6)
            .transition()
            .duration(500)
            .attr('r', 4);

        // 添加工具提示
        points.on('mouseover', function(event, d) {
            const tooltip = d3.select('body').append('div')
                .attr('class', 'map-tooltip')
                .style('opacity', 0);

            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            
            tooltip.html(`
                <strong>${d.city}, ${d.country}</strong><br/>
                访问时间: ${new Date(d.timestamp).toLocaleDateString()}
            `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.selectAll('.map-tooltip').remove();
        });

        // 添加连接线（可选）
        this.addConnectionLines(validVisitors);
    }

    // 添加连接线效果
    addConnectionLines(visitors) {
        if (visitors.length < 2) return;

        const lines = this.svg.append('g')
            .selectAll('line')
            .data(visitors.slice(0, -1))
            .enter().append('line')
            .attr('x1', d => this.projection([d.longitude, d.latitude])[0])
            .attr('y1', d => this.projection([d.longitude, d.latitude])[1])
            .attr('x2', (d, i) => this.projection([visitors[i + 1].longitude, visitors[i + 1].latitude])[0])
            .attr('y2', (d, i) => this.projection([visitors[i + 1].longitude, visitors[i + 1].latitude])[1])
            .attr('stroke', '#4ecdc4')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.3)
            .attr('stroke-dasharray', '5,5');
    }

    // 获取有效坐标的访问者
    getValidCoordinates() {
        return this.visitors.filter(v => 
            v.latitude !== 0 && v.longitude !== 0 && 
            !isNaN(v.latitude) && !isNaN(v.longitude)
        );
    }

    // 如果D3加载失败，渲染简单地图
    renderSimpleMap() {
        const mapDiv = document.getElementById('world-map-svg');
        if (!mapDiv) return;

        const countryStats = this.getCountryStats();
        
        mapDiv.innerHTML = `
            <div class="simple-map-fallback">
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
                <div class="country-grid">
                    ${Object.entries(countryStats).map(([country, count]) => `
                        <div class="country-card ${count > 1 ? 'high' : 'medium'}">
                            <div class="country-flag">${this.getCountryFlag(this.getCountryCode(country))}</div>
                            <div class="country-info">
                                <div class="country-name">${country}</div>
                                <div class="country-count">${count} 次访问</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 渲染访问者列表
    renderVisitorList() {
        const detailsDiv = document.getElementById('visitor-details-advanced');
        if (!detailsDiv) return;

        const recentVisitors = this.visitors
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        detailsDiv.innerHTML = recentVisitors.map(visitor => `
            <div class="visitor-item-advanced">
                <div class="visitor-flag">${this.getCountryFlag(visitor.countryCode)}</div>
                <div class="visitor-info">
                    <div class="visitor-location">
                        ${visitor.city}, ${visitor.country}
                    </div>
                    <div class="visitor-details-text">
                        <span class="visitor-time">${this.formatDate(visitor.timestamp)}</span>
                        ${visitor.latitude !== 0 && visitor.longitude !== 0 ? 
                            `<span class="visitor-coords">${visitor.latitude.toFixed(2)}, ${visitor.longitude.toFixed(2)}</span>` 
                            : ''
                        }
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

    // 根据国家名获取国家代码
    getCountryCode(countryName) {
        const visitor = this.visitors.find(v => v.country === countryName);
        return visitor ? visitor.countryCode : 'XX';
    }

    // 获取国家旗帜emoji
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
            new AdvancedVisitorMap();
        }, 1000);
    }
});

// 添加地图工具提示样式
const style = document.createElement('style');
style.textContent = `
    .map-tooltip {
        position: absolute;
        text-align: center;
        padding: 8px;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 4px;
        pointer-events: none;
        z-index: 1000;
    }
`;
document.head.appendChild(style); 