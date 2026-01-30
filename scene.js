// 场景配置
const SCENE_CONFIG = [
    { time: 0, name: '午夜深空', stars: 1200, color: '#0a0a2a', rotationSpeed: 0.001 },
    { time: 6, name: '黎明星云', stars: 800, color: '#3a1a5a', rotationSpeed: 0.0015 },
    { time: 12, name: '正午银河', stars: 1500, color: '#1a2a7a', rotationSpeed: 0.0008 },
    { time: 18, name: '黄昏星海', stars: 1000, color: '#2a0a4a', rotationSpeed: 0.0012 }
];

// 场景管理类
class Scene {
    constructor() {
        this.currentScene = SCENE_CONFIG[0];
        this.nextScene = SCENE_CONFIG[1];
        this.transitionProgress = 0;
        this.lastUpdate = Date.now();
    }

    update() {
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        this.lastUpdate = now;

        // 更新过渡进度
        this.transitionProgress += deltaTime / 3600000; // 每小时过渡
        if (this.transitionProgress >= 1) {
            this.transitionProgress = 0;
            this._updateCurrentScene();
        }

        return deltaTime;
    }

    _updateCurrentScene() {
        const hour = new Date().getHours();
        let currentConfig = SCENE_CONFIG.find(config => config.time === hour);
        
        if (!currentConfig) {
            // 找到最近的配置
            currentConfig = SCENE_CONFIG.reduce((prev, curr) => 
                Math.abs(curr.time - hour) < Math.abs(prev.time - hour) ? curr : prev
            );
        }

        this.currentScene = currentConfig;
        // 设置下一个场景
        const nextIndex = (SCENE_CONFIG.indexOf(currentConfig) + 1) % SCENE_CONFIG.length;
        this.nextScene = SCENE_CONFIG[nextIndex];
    }

    getInterpolatedScene() {
        return {
            name: this.currentScene.name,
            stars: this._interpolate(this.currentScene.stars, this.nextScene.stars),
            color: this._interpolateColor(this.currentScene.color, this.nextScene.color),
            rotationSpeed: this._interpolate(this.currentScene.rotationSpeed, this.nextScene.rotationSpeed)
        };
    }

    _interpolate(start, end) {
        return start + (end - start) * this.transitionProgress;
    }

    _interpolateColor(start, end) {
        // 简单的颜色插值实现
        return start; // 实际应用中应实现颜色插值
    }
}
