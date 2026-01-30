// 平台检测与抽象层
class Platform {
    static isWeb() {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }

    static isMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    }

    static isElectron() {
        return typeof process !== 'undefined' && process.versions && process.versions.electron;
    }

    static isReactNative() {
        return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
    }

    static getPlatform() {
        if (this.isElectron()) return 'electron';
        if (this.isReactNative()) return 'react-native';
        if (this.isMobile()) return 'mobile';
        return 'web';
    }
}

// 渲染器抽象类
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.platform = Platform.getPlatform();
    }

    static create(canvas) {
        return new Renderer(canvas);
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawStars(stars) {
        this.ctx.fillStyle = 'white';
        stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // 其他渲染方法...
}
