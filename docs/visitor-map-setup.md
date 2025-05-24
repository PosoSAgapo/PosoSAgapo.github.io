# 访问者地图功能说明 (Visitor Map Feature)

## 功能介绍

这个功能为你的个人主页添加了一个访问者IP统计和全球分布地图，可以：

- 🌍 **实时获取访问者位置**：自动获取访问者的IP地址和地理位置信息
- 📊 **统计数据显示**：显示总访问者数量、国家/地区数量等统计信息
- 🗺️ **世界地图可视化**：使用D3.js在真正的世界地图上显示访问者位置
- 📱 **响应式设计**：支持移动端和桌面端的完美显示
- 💾 **本地存储**：访问者数据保存在浏览器的本地存储中
- 🎨 **美观界面**：渐变背景、动画效果、深色模式支持

## 文件结构

```
assets/
├── js/
│   ├── visitor-map.js              # 基础版本（简单统计）
│   └── visitor-map-advanced.js     # 高级版本（D3.js地图）
└── css/
    └── visitor-map.css             # 样式文件

_includes/
├── head/
│   └── custom.html                 # 引入CSS文件
└── scripts.html                    # 引入JavaScript文件

_pages/
└── about.md                        # 主页添加容器元素
```

## 功能特点

### 1. 双版本支持
- **基础版本** (`visitor-map.js`)：简单的国家列表显示
- **高级版本** (`visitor-map-advanced.js`)：真正的世界地图可视化

### 2. 自动降级
如果D3.js库加载失败，会自动降级到简单的国家列表显示

### 3. 隐私保护
- 不收集个人敏感信息
- 数据仅存储在访问者的浏览器本地
- 使用公开的免费API获取地理位置信息

### 4. API服务
- **IP获取**：使用 [ipify.org](https://www.ipify.org/) 获取访问者IP
- **地理位置**：使用 [ipapi.co](https://ipapi.co/) 获取地理位置信息
- **地图数据**：使用 [world-atlas](https://unpkg.com/world-atlas@3/) 的世界地图数据

## 使用方法

### 1. 在主页添加容器
在你想要显示访问者地图的页面（如 `_pages/about.md`）中添加：

```html
<div id="visitor-map-container"></div>
```

### 2. 引入CSS文件
在 `_includes/head/custom.html` 中添加：

```html
<!-- Visitor Map CSS -->
<link rel="stylesheet" href="{{ base_path }}/assets/css/visitor-map.css"/>
```

### 3. 引入JavaScript文件
在 `_includes/scripts.html` 中添加：

```html
<!-- Visitor Map JavaScript (Advanced Version) -->
<script src="{{ base_path }}/assets/js/visitor-map-advanced.js"></script>
```

## 自定义配置

### 修改显示样式
可以通过修改 `assets/css/visitor-map.css` 文件来自定义：
- 颜色主题
- 布局方式
- 动画效果
- 响应式断点

### 切换版本
如果想使用基础版本，只需要在 `_includes/scripts.html` 中替换为：
```html
<script src="{{ base_path }}/assets/js/visitor-map.js"></script>
```

### 添加更多国家旗帜
在JavaScript文件中的 `getCountryFlag()` 函数中添加更多国家代码和对应的emoji。

## 技术实现

### 数据流程
1. 页面加载时自动获取访问者IP地址
2. 通过IP地址查询地理位置信息
3. 将访问者信息存储到浏览器本地存储
4. 渲染统计数据和地图可视化
5. 显示最近访问者列表

### 存储机制
访问者数据存储在 `localStorage` 中，键名为 `visitor-locations`，包含：
- IP地址
- 国家和城市
- 经纬度坐标
- 访问时间戳

### 性能优化
- 延迟1秒初始化，避免影响页面加载
- 动态加载D3.js库，不增加页面负担
- 限制显示的访问者数量（最多10个）
- 使用CSS动画增强用户体验

## 浏览器兼容性
- 现代浏览器（Chrome, Firefox, Safari, Edge）
- 支持ES6+ 语法
- 需要支持 `fetch` API
- 需要支持 `localStorage`

## 隐私声明
此功能仅用于统计目的：
- 不记录具体的街道地址
- 不收集个人身份信息
- 数据仅存储在访问者本地
- 不会传输数据到第三方服务器

## 故障排除

### 1. 地图不显示
- 检查网络连接是否正常
- 确认D3.js库是否成功加载
- 查看浏览器控制台是否有错误信息

### 2. 位置信息显示为Unknown
- 可能是API调用限制
- 检查ipapi.co的服务状态
- 确认网络是否可以访问外部API

### 3. 样式显示异常
- 确认CSS文件路径正确
- 检查是否有CSS冲突
- 验证Jekyll构建是否成功

## 更新日志

### v1.1 - 高级版本
- 添加D3.js世界地图可视化
- 支持访问者位置点动画
- 添加连接线效果
- 改进响应式设计

### v1.0 - 基础版本
- 基本的访问者统计功能
- 国家列表显示
- 本地存储支持
- 响应式布局

## 贡献
如果你有改进建议或发现bug，欢迎提出issue或pull request。

## 许可证
此功能遵循MIT许可证，可以自由使用和修改。 