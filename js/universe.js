/**
 * 3D宇宙星空系统
 * 创建飞船穿越宇宙的视觉效果
 */
class Universe {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.starCount = 400;
        this.speed = 2;
        this.maxSpeed = 20;
        this.acceleration = 0.05;
        this.warpMode = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 星星颜色配置
        this.colors = [
            '#ffffff', '#ffe9c4', '#d4fbff', '#ffdddd', '#ffffdd'
        ];
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    init() {
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push(this.createStar());
        }
    }

    createStar() {
        // 使用球形分布
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.max(this.canvas.width, this.canvas.height);
        const z = Math.random() * 2000;
        
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: z,
            size: Math.random() * 2 + 0.5,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            twinkle: Math.random() > 0.8,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            twinklePhase: Math.random() * Math.PI * 2,
            hasContent: Math.random() > 0.7, // 70%的星星包含内容
            pulsing: false,
            pulsePhase: 0
        };
    }

    update() {
        const targetSpeed = this.warpMode ? this.maxSpeed : 2;
        this.speed += (targetSpeed - this.speed) * 0.02;

        this.stars.forEach(star => {
            // 移动星星（向观察者靠近）
            star.z -= this.speed;
            
            // 如果星星太近，重置到远处
            if (star.z <= 0) {
                star.z = 2000;
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * Math.max(this.canvas.width, this.canvas.height) * 0.8;
                star.x = Math.cos(angle) * radius;
                star.y = Math.sin(angle) * radius;
                star.hasContent = Math.random() > 0.7;
                star.pulsing = false;
            }

            // 闪烁效果
            if (star.twinkle) {
                star.twinklePhase += star.twinkleSpeed;
            }

            // 脉冲效果（包含内容的星星）
            if (star.hasContent && !star.pulsing && Math.random() < 0.001) {
                star.pulsing = true;
            }
            
            if (star.pulsing) {
                star.pulsePhase += 0.1;
                if (star.pulsePhase > Math.PI * 2) {
                    star.pulsing = false;
                    star.pulsePhase = 0;
                }
            }
        });
    }

    draw() {
        // 清除画布（使用半透明实现拖尾效果）
        this.ctx.fillStyle = this.warpMode ? 
            'rgba(0, 5, 16, 0.3)' : 'rgba(0, 5, 16, 1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 按Z深度排序（远到近）
        this.stars.sort((a, b) => b.z - a.z);

        this.stars.forEach(star => {
            const scale = 1000 / (star.z + 1);
            const x2d = this.centerX + star.x * scale;
            const y2d = this.centerY + star.y * scale;
            
            // 计算大小
            let size = star.size * scale * 0.5;
            if (size < 0.1) size = 0.1;
            if (size > 4) size = 4;

            // 计算透明度（距离越远越暗）
            let alpha = Math.min(1, (2000 - star.z) / 1000);
            
            // 闪烁效果
            if (star.twinkle) {
                alpha *= 0.7 + 0.3 * Math.sin(star.twinklePhase);
            }

            // 脉冲效果（包含内容的星星有特殊标记）
            if (star.hasContent) {
                const pulseScale = star.pulsing ? 
                    1 + 0.5 * Math.sin(star.pulsePhase) : 1;
                size *= pulseScale;
                alpha = Math.min(1, alpha * (1 + pulseScale * 0.3));
                
                // 绘制光晕
                if (star.pulsing || scale > 1.5) {
                    const gradient = this.ctx.createRadialGradient(
                        x2d, y2d, 0,
                        x2d, y2d, size * 4
                    );
                    gradient.addColorStop(0, `rgba(0, 240, 255, ${alpha * 0.4})`);
                    gradient.addColorStop(0.5, `rgba(0, 150, 255, ${alpha * 0.2})`);
                    gradient.addColorStop(1, 'transparent');
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(x2d, y2d, size * 4, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            // 绘制星星本体
            this.ctx.beginPath();
            this.ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
            
            if (star.hasContent && star.pulsing) {
                this.ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#00f0ff';
            } else {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.shadowBlur = star.hasContent ? 5 : 0;
                this.ctx.shadowColor = star.color;
            }
            
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // 如果是曲速模式，绘制拖尾
            if (this.warpMode && star.z < 1500) {
                const tailLength = Math.min(50, (1500 - star.z) * 0.1);
                const prevX = this.centerX + star.x * (1000 / (star.z + this.speed * 5 + 1));
                const prevY = this.centerY + star.y * (1000 / (star.z + this.speed * 5 + 1));
                
                this.ctx.beginPath();
                this.ctx.moveTo(x2d, y2d);
                this.ctx.lineTo(prevX, prevY);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
                this.ctx.lineWidth = size * 0.5;
                this.ctx.stroke();
            }
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    // 获取点击位置对应的星星
    getStarAtPosition(x, y) {
        // 找到距离点击位置最近的可见星星
        let closestStar = null;
        let closestDist = Infinity;
        const threshold = 50; // 点击阈值

        this.stars.forEach(star => {
            if (!star.hasContent) return;
            
            const scale = 1000 / (star.z + 1);
            const x2d = this.centerX + star.x * scale;
            const y2d = this.centerY + star.y * scale;
            
            // 只考虑较近的星星（Z < 1000）
            if (star.z > 1000) return;

            const dist = Math.sqrt((x - x2d) ** 2 + (y - y2d) ** 2);
            if (dist < threshold && dist < closestDist) {
                closestDist = dist;
                closestStar = star;
            }
        });

        return closestStar;
    }

    // 激活曲速模式（页面切换时使用）
    activateWarp() {
        this.warpMode = true;
        setTimeout(() => {
            this.warpMode = false;
        }, 3000);
    }
}
