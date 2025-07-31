// 游戏状态管理
class GameState {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.target = 1000;
        this.time = 60;
        this.bombs = 3;
        this.gameRunning = false;
        this.gameStarted = false;
        this.strength = 1;
        this.luck = 1;
    }

    reset() {
        this.score = 0;
        this.time = 60;
        this.bombs = 3;
        this.gameRunning = false;
        this.gameStarted = false;
    }

    nextLevel() {
        this.level++;
        this.target = Math.floor(this.target * 1.5);
        this.time = Math.max(45, 60 - this.level * 2);
        this.bombs = 3;
        this.gameRunning = false;
        this.gameStarted = false;
    }
}

// 矿工类
class Miner {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.angleDirection = 1;
        this.swingSpeed = 0.02;
    }

    update() {
        if (!hook.isActive) {
            this.angle += this.angleDirection * this.swingSpeed;
            // 钩子从水平位置开始，只向下摆动，范围从-90度到+90度
            // 这样钩子永远不会向上发射，符合物理常识
            const maxAngle = Math.PI / 2; // 90度
            if (this.angle > maxAngle || this.angle < -maxAngle) {
                this.angleDirection *= -1;
            }
        }
    }

    draw(ctx) {
        // 绘制矿工身体（蓝色工作服）
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(this.x - 18, this.y - 35, 36, 45);
        
        // 绘制工作服纽扣
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 25, 2, 0, Math.PI * 2);
        ctx.arc(this.x, this.y - 15, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制矿工头部
        ctx.fillStyle = '#FDBCB4';
        ctx.beginPath();
        ctx.arc(this.x, this.y - 45, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制矿工帽子（经典黄色安全帽）
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - 52, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制帽子顶部
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - 55, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制眼睛
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 48, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 5, this.y - 48, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制胡子
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x - 8, this.y - 40, 16, 4);
        
        // 绘制手臂
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(this.x - 25, this.y - 30, 10, 25);
        ctx.fillRect(this.x + 15, this.y - 30, 10, 25);
        
        // 绘制腿部
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(this.x - 12, this.y + 10, 10, 20);
        ctx.fillRect(this.x + 2, this.y + 10, 10, 20);
        
        // 绘制靴子
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x - 15, this.y + 28, 16, 8);
        ctx.fillRect(this.x - 1, this.y + 28, 16, 8);
    }
}

// 钩子类
class Hook {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.length = 0;
        this.maxLength = 500;
        this.speed = 3;
        this.isActive = false;
        this.isReturning = false;
        this.caughtItem = null;
        this.angle = 0;
    }

    launch(angle) {
        if (!this.isActive) {
            this.isActive = true;
            this.isReturning = false;
            this.angle = angle;
            this.length = 0;
            this.caughtItem = null;
        }
    }

    update() {
        if (!this.isActive) return;

        if (!this.isReturning) {
            // 钩子向下延伸
            this.length += this.speed;
            this.x = this.startX + Math.sin(this.angle) * this.length;
            this.y = this.startY + Math.cos(this.angle) * this.length;

            // 检查是否到达最大长度或碰撞
            if (this.length >= this.maxLength || this.y >= canvas.height - 20) {
                this.isReturning = true;
            }

            // 检查与物品的碰撞
            this.checkCollisions();
        } else {
            // 钩子返回
            const returnSpeed = this.caughtItem ? 
                Math.max(1, this.speed - this.caughtItem.weight * 0.5) * gameState.strength : 
                this.speed * 2;
            
            this.length -= returnSpeed;
            this.x = this.startX + Math.sin(this.angle) * this.length;
            this.y = this.startY + Math.cos(this.angle) * this.length;

            // 更新被抓物品的位置
            if (this.caughtItem) {
                this.caughtItem.x = this.x;
                this.caughtItem.y = this.y + 10;
            }

            // 检查是否返回到起点
            if (this.length <= 0) {
                this.reset();
                if (this.caughtItem) {
                    this.collectItem();
                }
            }
        }
    }

    checkCollisions() {
        for (let item of gameItems) {
            const dx = this.x - item.x;
            const dy = this.y - item.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < item.size) {
                this.caughtItem = item;
                this.isReturning = true;
                // 从数组中移除物品
                const index = gameItems.indexOf(item);
                if (index > -1) {
                    gameItems.splice(index, 1);
                }
                break;
            }
        }
    }

    collectItem() {
        if (this.caughtItem) {
            gameState.score += this.caughtItem.value;
            updateUI();
            
            // 播放音效（模拟）
            if (this.caughtItem.value > 0) {
                console.log(`获得 ${this.caughtItem.type}! +${this.caughtItem.value} 分`);
            } else {
                console.log(`抓到了 ${this.caughtItem.type}! ${this.caughtItem.value} 分`);
            }
            
            this.caughtItem = null;
        }
    }

    reset() {
        this.isActive = false;
        this.isReturning = false;
        this.length = 0;
        this.x = this.startX;
        this.y = this.startY;
    }

    draw(ctx) {
        // 计算钩子位置（未激活时显示在矿工下方，水平摆动）
        let hookX = this.isActive ? this.x : this.startX + Math.sin(miner.angle) * 50;
        let hookY = this.isActive ? this.y : this.startY + 40 + Math.abs(Math.cos(miner.angle)) * 20; // 钩子往下一点，在地面平行位置
        
        if (this.isActive) {
            // 绘制钩子线（更粗更明显）
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.startX, this.startY);
            ctx.lineTo(hookX, hookY);
            ctx.stroke();
        }

        // 绘制U形钩子主体（始终可见）
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // 绘制U形钩子
        ctx.arc(hookX, hookY + 8, 12, Math.PI, 0, false);
        ctx.stroke();
        
        // 绘制钩子尖端（左侧）
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(hookX - 12, hookY + 8);
        ctx.lineTo(hookX - 8, hookY + 4);
        ctx.stroke();
        
        // 绘制钩子尖端（右侧）
        ctx.beginPath();
        ctx.moveTo(hookX + 12, hookY + 8);
        ctx.lineTo(hookX + 8, hookY + 4);
        ctx.stroke();
        
        // 绘制钩子连接点
        ctx.fillStyle = '#A0A0A0';
        ctx.beginPath();
        ctx.arc(hookX, hookY, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 游戏物品基类
class GameItem {
    constructor(x, y, size, value, weight, color, type) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.value = value;
        this.weight = weight;
        this.color = color;
        this.type = type;
        this.rotation = Math.random() * Math.PI * 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        switch(this.type) {
            case '大金块':
                this.drawLargeGold(ctx);
                break;
            case '小金块':
                this.drawSmallGold(ctx);
                break;
            case '钻石':
                this.drawDiamond(ctx);
                break;
            case '金袋':
                this.drawGoldBag(ctx);
                break;
            case '石头':
                this.drawRock(ctx);
                break;
            case '骷髅':
                this.drawSkull(ctx);
                break;
        }
        
        ctx.restore();
    }

    drawLargeGold(ctx) {
        // 绘制大金块（更真实的金块形状）
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        // 创建不规则的金块轮廓
        ctx.moveTo(-this.size/2.2, -this.size/2.5);
        ctx.quadraticCurveTo(-this.size/1.8, -this.size/1.5, -this.size/3, -this.size/2.2);
        ctx.quadraticCurveTo(this.size/4, -this.size/1.8, this.size/2.5, -this.size/3);
        ctx.quadraticCurveTo(this.size/1.8, this.size/4, this.size/2.2, this.size/2.8);
        ctx.quadraticCurveTo(this.size/4, this.size/1.8, -this.size/3.5, this.size/2.2);
        ctx.quadraticCurveTo(-this.size/1.5, this.size/3, -this.size/2.2, -this.size/2.5);
        ctx.closePath();
        ctx.fill();
        
        // 添加金属光泽渐变
        const gradient = ctx.createRadialGradient(-this.size/4, -this.size/4, 0, 0, 0, this.size);
        gradient.addColorStop(0, '#FFFF99');
        gradient.addColorStop(0.3, '#FFD700');
        gradient.addColorStop(0.7, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 添加金块表面纹理
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const angle = (i * Math.PI * 2) / 5;
            const startX = Math.cos(angle) * this.size * 0.3;
            const startY = Math.sin(angle) * this.size * 0.3;
            const endX = Math.cos(angle) * this.size * 0.6;
            const endY = Math.sin(angle) * this.size * 0.6;
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // 添加强烈的高光点
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-this.size/3, -this.size/3, this.size/12, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSmallGold(ctx) {
        // 绘制小金块（更真实的小金粒形状）
        const gradient = ctx.createRadialGradient(-this.size/3, -this.size/3, 0, 0, 0, this.size * 1.2);
        gradient.addColorStop(0, '#FFFF99');
        gradient.addColorStop(0.2, '#FFD700');
        gradient.addColorStop(0.6, '#FFA500');
        gradient.addColorStop(1, '#DAA520');
        ctx.fillStyle = gradient;
        
        // 绘制不规则的小金块
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const radius = this.size * (0.8 + Math.random() * 0.4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // 添加金属光泽边缘
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 添加高光点
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-this.size/3, -this.size/3, this.size/8, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加小的反光点
        ctx.fillStyle = '#FFFF99';
        ctx.beginPath();
        ctx.arc(this.size/4, this.size/4, this.size/12, 0, Math.PI * 2);
        ctx.fill();
    }

    drawDiamond(ctx) {
        // 绘制钻石（经典切面钻石形状）
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        // 钻石上半部分（锥形）
        ctx.moveTo(0, -this.size * 1.2);
        ctx.lineTo(-this.size * 0.6, -this.size * 0.3);
        ctx.lineTo(-this.size * 0.8, 0);
        ctx.lineTo(0, this.size * 0.8);
        ctx.lineTo(this.size * 0.8, 0);
        ctx.lineTo(this.size * 0.6, -this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 钻石切面效果
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 1.2);
        ctx.lineTo(-this.size * 0.3, -this.size * 0.3);
        ctx.lineTo(0, -this.size * 0.1);
        ctx.lineTo(this.size * 0.3, -this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 钻石左侧切面
        ctx.fillStyle = '#4682B4';
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.6, -this.size * 0.3);
        ctx.lineTo(-this.size * 0.3, -this.size * 0.3);
        ctx.lineTo(0, -this.size * 0.1);
        ctx.lineTo(-this.size * 0.4, 0);
        ctx.closePath();
        ctx.fill();
        
        // 钻石右侧切面
        ctx.fillStyle = '#B0E0E6';
        ctx.beginPath();
        ctx.moveTo(this.size * 0.6, -this.size * 0.3);
        ctx.lineTo(this.size * 0.3, -this.size * 0.3);
        ctx.lineTo(0, -this.size * 0.1);
        ctx.lineTo(this.size * 0.4, 0);
        ctx.closePath();
        ctx.fill();
        
        // 钻石闪光效果
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-this.size * 0.2, -this.size * 0.6, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGoldBag(ctx) {
        // 绘制钱袋主体（梨形）
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(0, this.size * 0.2, this.size * 0.8, this.size * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制钱袋口部
        ctx.fillStyle = '#654321';
        ctx.fillRect(-this.size * 0.6, -this.size * 0.8, this.size * 1.2, this.size * 0.4);
        
        // 绘制钱袋绳子
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.4, -this.size * 0.6);
        ctx.lineTo(-this.size * 0.2, -this.size * 1.0);
        ctx.moveTo(this.size * 0.4, -this.size * 0.6);
        ctx.lineTo(this.size * 0.2, -this.size * 1.0);
        ctx.stroke();
        
        // 绘制美元符号
        ctx.fillStyle = '#FFD700';
        ctx.font = `bold ${this.size * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, this.size * 0.3);
        
        // 添加钱袋纹理线条
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.size * 0.15, -this.size * 0.2);
            ctx.lineTo(i * this.size * 0.1, this.size * 0.8);
            ctx.stroke();
        }
    }

    drawRock(ctx) {
        // 绘制更真实的石头形状
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        // 创建不规则的石头轮廓
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            const radius = this.size * (0.7 + Math.random() * 0.6);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // 添加石头纹理渐变
        const gradient = ctx.createRadialGradient(-this.size/4, -this.size/4, 0, 0, 0, this.size * 1.2);
        gradient.addColorStop(0, '#A9A9A9');
        gradient.addColorStop(0.4, '#808080');
        gradient.addColorStop(0.8, '#696969');
        gradient.addColorStop(1, '#2F4F4F');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 添加石头表面的裂纹和纹理
        ctx.strokeStyle = '#2F4F4F';
        ctx.lineWidth = 1;
        // 绘制随机裂纹
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const startAngle = Math.random() * Math.PI * 2;
            const startX = Math.cos(startAngle) * this.size * 0.3;
            const startY = Math.sin(startAngle) * this.size * 0.3;
            const endAngle = startAngle + (Math.random() - 0.5) * Math.PI;
            const endX = Math.cos(endAngle) * this.size * 0.7;
            const endY = Math.sin(endAngle) * this.size * 0.7;
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // 添加石头表面的小凹凸
        ctx.fillStyle = '#2F4F4F';
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.size * 0.6;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 添加高光（石头的反光面）
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.arc(-this.size/3, -this.size/3, this.size/10, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSkull(ctx) {
        ctx.fillStyle = '#F5F5DC';
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-this.size/3, -this.size/4, this.size/6, 0, Math.PI * 2);
        ctx.arc(this.size/3, -this.size/4, this.size/6, 0, Math.PI * 2);
        ctx.fill();
        
        // 嘴巴
        ctx.beginPath();
        ctx.arc(0, this.size/3, this.size/4, 0, Math.PI);
        ctx.fill();
    }
}

// 游戏变量
let canvas, ctx;
let gameState;
let miner, hook;
let gameItems = [];
let gameTimer;
let animationId;

// 关卡配置
const levelConfigs = [
    { target: 1000, time: 60, items: 15 },
    { target: 1500, time: 55, items: 18 },
    { target: 2200, time: 50, items: 20 },
    { target: 3000, time: 45, items: 22 },
    { target: 4000, time: 40, items: 25 }
];

// 初始化游戏
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    gameState = new GameState();
    miner = new Miner(canvas.width / 2, 80);
    hook = new Hook(canvas.width / 2, 80);
    
    setupEventListeners();
    updateUI();
    showModal('游戏开始', '准备好开始挖金子了吗？', ['start']);
}

// 设置事件监听器
function setupEventListeners() {
    // 鼠标点击
    canvas.addEventListener('click', () => {
        if (gameState.gameRunning && !hook.isActive) {
            hook.launch(miner.angle);
        }
    });
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        if (gameState.gameRunning) {
            if ((e.code === 'Space' || e.code === 'ArrowDown') && !hook.isActive) {
                e.preventDefault();
                hook.launch(miner.angle);
            } else if ((e.code === 'KeyB' || e.code === 'ArrowUp') && gameState.bombs > 0 && hook.caughtItem) {
                // 使用炸药
                e.preventDefault();
                gameState.bombs--;
                hook.caughtItem = null;
                hook.isReturning = true;
                updateUI();
                console.log('使用炸药炸毁物品!');
            }
        }
    });
    
    // 按钮事件
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('nextBtn').addEventListener('click', nextLevel);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('menuBtn').addEventListener('click', showMenu);
    document.getElementById('closeShop').addEventListener('click', closeShop);
    
    // 商店购买事件
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.dataset.item;
            buyItem(item);
        });
    });
}

// 生成游戏物品
function generateItems() {
    gameItems = [];
    const config = levelConfigs[Math.min(gameState.level - 1, levelConfigs.length - 1)];
    const itemCount = config.items;
    
    const itemTypes = [
        { type: '大金块', value: 500, weight: 3, size: 125, color: '#FFD700', probability: 0.08 * gameState.luck },
        { type: '小金块', value: 100, weight: 1.5, size: 15, color: '#FFD700', probability: 0.18 },
        { type: '钻石', value: 800, weight: 0.5, size: 12, color: '#00FFFF', probability: 0.12 * gameState.luck },
        { type: '金袋', value: 50, weight: 0.8, size: 10, color: '#8B4513', probability: 0.22 },
        { type: '石头', value: 10, weight: 2, size: 18, color: '#696969', probability: 0.35 }, // 大幅增加石头概率
        { type: '骷髅', value: -50, weight: 1, size: 16, color: '#F5F5DC', probability: 0.05 }
    ];
    
    for (let i = 0; i < itemCount; i++) {
        const x = Math.random() * (canvas.width - 100) + 50;
        const y = Math.random() * (canvas.height - 200) + 150;
        
        // 根据概率选择物品类型
        const rand = Math.random();
        let cumulativeProbability = 0;
        let selectedType = itemTypes[itemTypes.length - 1]; // 默认选择最后一个
        
        for (let type of itemTypes) {
            cumulativeProbability += type.probability;
            if (rand <= cumulativeProbability) {
                selectedType = type;
                break;
            }
        }
        
        const item = new GameItem(
            x, y, 
            selectedType.size, 
            selectedType.value, 
            selectedType.weight, 
            selectedType.color, 
            selectedType.type
        );
        
        gameItems.push(item);
    }
}

// 开始游戏
function startGame() {
    hideModal();
    gameState.gameStarted = true;
    gameState.gameRunning = true;
    
    generateItems();
    startTimer();
    gameLoop();
}

// 下一关
function nextLevel() {
    hideModal();
    gameState.nextLevel();
    updateUI();
    startGame();
}

// 重新开始游戏
function restartGame() {
    hideModal();
    gameState.reset();
    gameState.level = 1;
    gameState.target = 1000;
    updateUI();
    startGame();
}

// 显示菜单
function showMenu() {
    hideModal();
    gameState.reset();
    gameState.level = 1;
    gameState.target = 1000;
    updateUI();
    showModal('游戏开始', '准备好开始挖金子了吗？', ['start']);
}

// 游戏主循环
function gameLoop() {
    if (!gameState.gameRunning) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    drawBackground();
    
    // 更新游戏对象
    miner.update();
    hook.update();
    
    // 绘制游戏对象
    drawItems();
    miner.draw(ctx);
    hook.draw(ctx);
    
    // 移除每帧检查游戏结束，只在时间结束时检查
    
    animationId = requestAnimationFrame(gameLoop);
}

// 绘制背景
function drawBackground() {
    // 天空
    const gradient = ctx.createLinearGradient(0, 0, 0, 120);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 120);
    
    // 地面
    const groundGradient = ctx.createLinearGradient(0, 120, 0, canvas.height);
    groundGradient.addColorStop(0, '#8B4513');
    groundGradient.addColorStop(1, '#654321');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, 120, canvas.width, canvas.height - 120);
    
    // 绘制地面分界线
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 120);
    ctx.lineTo(canvas.width, 120);
    ctx.stroke();
}

// 绘制物品
function drawItems() {
    for (let item of gameItems) {
        item.draw(ctx);
    }
    
    // 绘制被抓住的物品
    if (hook.caughtItem) {
        hook.caughtItem.draw(ctx);
    }
}

// 开始计时器
function startTimer() {
    gameTimer = setInterval(() => {
        if (gameState.gameRunning) {
            gameState.time--;
            updateUI();
            
            if (gameState.time <= 0) {
                endGame();
            }
        }
    }, 1000);
}

// 检查游戏结束
function checkGameEnd() {
    if (gameState.score >= gameState.target) {
        // 过关
        gameState.gameRunning = false;
        clearInterval(gameTimer);
        cancelAnimationFrame(animationId);
        
        if (gameState.level < 5) {
            showModal('恭喜过关！', `太棒了！你在第${gameState.level}关获得了${gameState.score}分！\n目标分数：${gameState.target}`, ['next', 'menu']);
        } else {
            showModal('游戏通关！', `恭喜你完成了所有关卡！\n最终分数：${gameState.score}`, ['restart', 'menu']);
        }
    }
}

// 游戏结束
function endGame() {
    gameState.gameRunning = false;
    clearInterval(gameTimer);
    cancelAnimationFrame(animationId);
    
    if (gameState.score >= gameState.target) {
        checkGameEnd();
    } else {
        showModal('游戏结束', `时间到了！你获得了${gameState.score}分\n目标分数：${gameState.target}\n差一点就成功了，再试一次吧！`, ['restart', 'menu']);
    }
}

// 更新UI
function updateUI() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('target').textContent = gameState.target;
    document.getElementById('time').textContent = gameState.time;
    document.getElementById('bombs').textContent = gameState.bombs;
}

// 显示弹窗
function showModal(title, message, buttons) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    
    // 隐藏所有按钮
    document.querySelectorAll('.modal-buttons .btn').forEach(btn => {
        btn.classList.add('hidden');
    });
    
    // 显示指定按钮
    buttons.forEach(btnType => {
        const btnId = btnType === 'start' ? 'startBtn' : 
                     btnType === 'next' ? 'nextBtn' : 
                     btnType === 'restart' ? 'restartBtn' : 'menuBtn';
        document.getElementById(btnId).classList.remove('hidden');
    });
    
    document.getElementById('gameModal').classList.remove('hidden');
}

// 隐藏弹窗
function hideModal() {
    document.getElementById('gameModal').classList.add('hidden');
}

// 显示商店
function showShop() {
    document.getElementById('shopModal').classList.remove('hidden');
}

// 关闭商店
function closeShop() {
    document.getElementById('shopModal').classList.add('hidden');
}

// 购买物品
function buyItem(item) {
    let cost = 0;
    let success = false;
    
    switch(item) {
        case 'bomb':
            cost = 100;
            if (gameState.score >= cost) {
                gameState.score -= cost;
                gameState.bombs++;
                success = true;
            }
            break;
        case 'strength':
            cost = 200;
            if (gameState.score >= cost && gameState.strength < 3) {
                gameState.score -= cost;
                gameState.strength += 0.5;
                success = true;
            }
            break;
        case 'luck':
            cost = 300;
            if (gameState.score >= cost && gameState.luck < 2) {
                gameState.score -= cost;
                gameState.luck += 0.2;
                success = true;
            }
            break;
    }
    
    if (success) {
        updateUI();
        console.log(`购买成功！花费${cost}金币`);
    } else {
        console.log('金币不足或已达到最大等级！');
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('load', initGame);

// 防止页面刷新时丢失游戏状态
window.addEventListener('beforeunload', (e) => {
    if (gameState && gameState.gameRunning) {
        e.preventDefault();
        e.returnValue = '游戏正在进行中，确定要离开吗？';
    }
});

// 页面失去焦点时暂停游戏
window.addEventListener('blur', () => {
    if (gameState && gameState.gameRunning) {
        gameState.gameRunning = false;
        clearInterval(gameTimer);
        cancelAnimationFrame(animationId);
    }
});

// 页面获得焦点时恢复游戏
window.addEventListener('focus', () => {
    if (gameState && gameState.gameStarted && !gameState.gameRunning && gameState.time > 0) {
        gameState.gameRunning = true;
        startTimer();
        gameLoop();
    }
});