/**
 * 星空诗语 - 动态星空背景与诗句交互系统
 * 基于Canvas实现星空渲染、粒子效果、视差移动和闪烁动画
 * 支持星星点击事件处理与随机诗句展示
 * 使用本地JSON数据模拟数据库操作
 */

class Star {
    /**
     * 星星类，表示星空中的单个星星
     * @constructor
     */
    constructor() {
        this.reset();
    }

    /**
     * 重置星星属性，用于初始化或复用
     */
    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.z = Math.random() * 2000; // 深度值，影响视差效果
        this.size = Math.random() * 1.5 + 0.5; // 星星大小
        this.brightness = Math.random() * 0.8 + 0.2; // 基础亮度
        this.twinkleSpeed = Math.random() * 0.02 + 0.01; // 闪烁速度
        this.twinklePhase = Math.random() * Math.PI * 2; // 闪烁相位
        this.vx = (Math.random() - 0.5) * 0.2; // 水平移动速度
        this.vy = (Math.random() - 0.5) * 0.2; // 垂直移动速度
    }

    /**
     * 更新星星状态
     * @param {number} time - 当前时间戳（秒）
     */
    update(time) {
        // 视差移动：深度越大的星星移动越慢
        this.x += this.vx * (this.z / 1000);
        this.y += this.vy * (this.z / 1000);

        // 边界循环处理
        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;

        // 正弦波闪烁动画
        this.brightness = 0.5 + 0.5 * Math.sin(time * this.twinkleSpeed + this.twinklePhase);
    }

    /**
     * 绘制星星到Canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     */
    draw(ctx) {
        const alpha = this.brightness * (1 - this.z / 2000);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
    }
}

class Particle {
    /**
     * 粒子类，用于点击爆炸效果
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4; // 随机水平速度
        this.vy = (Math.random() - 0.5) * 4; // 随机垂直速度
        this.life = 1.0; // 生命值
        this.decay = Math.random() * 0.03 + 0.02; // 衰减速率
        this.size = Math.random() * 3 + 1; // 粒子大小
        this.color = `hsl(${Math.random() * 60 + 30}, 100%, 70%)`; // 金黄到紫色色调
    }

    /**
     * 更新粒子状态
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vy += 0.1; // 模拟重力效果
    }

    /**
     * 绘制粒子到Canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     */
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1; // 恢复全局透明度
    }

    /**
     * 判断粒子是否已死亡（生命值耗尽）
     * @returns {boolean} 是否已死亡
     */
    isDead() {
        return this.life <= 0;
    }
}

class PoetryDataManager {
    /**
     * 诗句数据管理器，模拟本地数据库操作
     * @constructor
     */
    constructor() {
        this.data = []; // 存储加载的诗句数据
        this.viewedIds = new Set(); // 已查看的诗句ID集合
        this.currentFilter = 'all'; // 当前过滤类型
        this.stats = {
            total: 0,
            poetry: 0,
            quote: 0
        };
    }

    /**
     * 异步加载诗句数据
     * @returns {Promise<void>}
     */
    async loadData() {
        try {
            const response = await fetch('./poetry_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this._calculateStats();
        } catch (error) {
            console.error('Failed to load poetry data:', error);
            // 使用备用数据以防加载失败
            this.data = [
                { quote: "数据加载失败，暂无诗句显示", author: "系统", type: "poetry" }
            ];
            this._calculateStats();
        }
    }

    /**
     * 计算统计数据
     * @private
     */
    _calculateStats() {
        this.stats.total = this.data.length;
        this.stats.poetry = this.data.filter(item => item.type === 'poetry').length;
        this.stats.quote = this.data.filter(item => item.type === 'quote').length;
    }

    /**
     * 获取统计数据
     * @returns {Object} 统计信息对象
     */
    getStats() {
        return { ...this.stats, viewed: this.viewedIds.size };
    }

    /**
     * 设置当前过滤类型
     * @param {string} filter - 过滤类型 ('all', 'poetry', 'quote')
     */
    setFilter(filter) {
        if (['all', 'poetry', 'quote'].includes(filter)) {
            this.currentFilter = filter;
        }
    }

    /**
     * 重置已查看记录
     */
    resetViewed() {
        this.viewedIds.clear();
    }

    /**
     * 获取随机诗句（排除已查看的）
     * @returns {Object|null} 诗句对象或null
     */
    getRandomQuote() {
        // 应用过滤器
        let filteredData = this.data;
        if (this.currentFilter !== 'all') {
            filteredData = this.data.filter(item => item.type === this.currentFilter);
        }

        // 过滤出未查看的诗句
        const unviewedIndices = [];
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            if (filteredData.includes(item) && !this.viewedIds.has(i)) {
                unviewedIndices.push(i);
            }
        }

        // 若所有诗句均已查看，则重置并重新获取
        if (unviewedIndices.length === 0) {
            this.resetViewed();
            return this.getRandomQuote();
        }

        // 随机选择一个未查看的诗句
        const randomIndex = Math.floor(Math.random() * unviewedIndices.length);
        const quoteIndex = unviewedIndices[randomIndex];
        const quote = this.data[quoteIndex];

        // 标记为已查看
        this.viewedIds.add(quoteIndex);

        return { ...quote, id: quoteIndex };
    }
}

// 全局应用状态
const app = {
    canvas: null,
    ctx: null,
    stars: [],
    particles: [],
    quoteManager: null,
    animationId: null
};

/**
 * 初始化Canvas
 */
function initCanvas() {
    app.canvas = document.getElementById('starCanvas');
    app.ctx = app.canvas.getContext('2d');
    resizeCanvas();
}

/**
 * 调整Canvas尺寸以适应窗口
 */
function resizeCanvas() {
    app.canvas.width = window.innerWidth;
    app.canvas.height = window.innerHeight;
    initStars();
}

/**
 * 初始化星星数组
 */
function initStars() {
    const density = Math.min(800, Math.floor((window.innerWidth * window.innerHeight) / 2000));
    app.stars = [];
    for (let i = 0; i < density; i++) {
        app.stars.push(new Star());
    }
}

/**
 * 创建点击特效
 * @param {number} x - 点击X坐标
 * @param {number} y - 点击Y坐标
 */
function createClickEffect(x, y) {
    // 光晕效果
    const gradient = app.ctx.createRadialGradient(x, y, 0, x, y, 50);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.7)');
    gradient.addColorStop(1, 'transparent');
    app.ctx.beginPath();
    app.ctx.arc(x, y, 50, 0, Math.PI * 2);
    app.ctx.fillStyle = gradient;
    app.ctx.fill();

    // 粒子爆炸效果
    for (let i = 0; i < 20; i++) {
        app.particles.push(new Particle(x, y));
    }
}

/**
 * 查找最近的可点击星星
 * @param {number} x - 鼠标X坐标
 * @param {number} y - 鼠标Y坐标
 * @returns {Object|null} 最近的星星对象或null
 */
function findClosestStar(x, y) {
    let closestStar = null;
    let minDist = 30; // 最大点击半径

    for (const star of app.stars) {
        const dist = Math.sqrt((star.x - x) ** 2 + (star.y - y) ** 2);
        if (dist < minDist && dist < 50 - star.z / 50) {
            minDist = dist;
            closestStar = star;
        }
    }

    return closestStar;
}

/**
 * 处理点击事件
 * @param {Event} e - 鼠标或触摸事件
 */
function handleClick(e) {
    const rect = app.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const star = findClosestStar(x, y);
    if (star) {
        createClickEffect(star.x, star.y);
        const quote = app.quoteManager.getRandomQuote();
        displayQuote(quote);
    }
}

/**
 * 显示诗句到页面
 * @param {Object} quote - 诗句对象
 */
function displayQuote(quote) {
    document.getElementById('quoteText').textContent = quote.quote;
    document.getElementById('quoteAuthor').textContent = `—— ${quote.author}`;
    document.getElementById('quoteSource').textContent = quote.source || '';
    const stats = app.quoteManager.getStats();
    document.getElementById('totalCount').textContent = `总内容: ${stats.total} 条`;
    document.getElementById('poetryCount').textContent = `诗句: ${stats.poetry} 条`;
    document.getElementById('quoteCount').textContent = `名言: ${stats.quote} 条`;
    document.getElementById('exploredCount').textContent = `已探索: ${stats.viewed} 条`;
}

/**
 * 动画主循环
 * @param {number} timestamp - 当前时间戳
 */
function animate(timestamp) {
    app.ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);

    // 更新并绘制星星
    for (const star of app.stars) {
        star.update(timestamp / 1000);
        star.draw(app.ctx);
    }

    // 更新并绘制粒子
    for (let i = app.particles.length - 1; i >= 0; i--) {
        app.particles[i].update();
        app.particles[i].draw(app.ctx);
        if (app.particles[i].isDead()) {
            app.particles.splice(i, 1);
        }
    }

    app.animationId = requestAnimationFrame(animate);
}

/**
 * 初始化控制面板事件监听
 */
function initControls() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            app.quoteManager.setFilter(filter);
        });
    });
}

/**
 * 应用初始化入口
 */
async function initApp() {
    app.quoteManager = new PoetryDataManager();
    await app.quoteManager.loadData();
    initCanvas();
    animate(0);

    // 事件监听
    app.canvas.addEventListener('click', handleClick);
    app.canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        handleClick(e.touches[0]);
    });

    initControls();
    window.addEventListener('resize', resizeCanvas);
}

// 页面加载完成后启动应用
window.addEventListener('load', initApp);
