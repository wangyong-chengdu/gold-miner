#!/bin/bash

# 黄金矿工游戏 - 阿里云自动部署脚本（使用Git Clone方式）

echo "🎮 开始部署黄金矿工游戏到阿里云服务器..."

# 服务器配置
SERVER_HOST="47.115.230.75"
SERVER_USER="root"
SERVER_PATH="/var/www/html/gold-miner"
GITHUB_REPO="https://github.com/wangyong-chengdu/gold-miner.git"

# 在服务器上克隆或更新代码
echo "📦 从GitHub克隆/更新代码..."
ssh $SERVER_USER@$SERVER_HOST "
    if [ -d '$SERVER_PATH' ]; then
        echo '📁 目录已存在，更新代码...'
        cd $SERVER_PATH && git pull origin main
    else
        echo '📁 克隆新仓库...'
        git clone $GITHUB_REPO $SERVER_PATH
    fi
"

if [ $? -eq 0 ]; then
    echo "✅ 代码部署成功！"
else
    echo "❌ 代码部署失败！请检查网络连接和服务器配置"
    exit 1
fi

# 设置文件权限
echo "🔧 设置文件权限..."
ssh $SERVER_USER@$SERVER_HOST "chmod -R 755 $SERVER_PATH"

# 创建Nginx配置（如果不存在）
echo "⚙️ 配置Web服务器..."
ssh $SERVER_USER@$SERVER_HOST "cat > /etc/nginx/sites-available/gold-miner << 'EOF'
server {
    listen 80;
    server_name _;
    
    location /gold-miner {
        alias $SERVER_PATH;
        index index.html;
        try_files \$uri \$uri/ =404;
    }
}
EOF"

# 启用站点并重启Nginx
ssh $SERVER_USER@$SERVER_HOST "ln -sf /etc/nginx/sites-available/gold-miner /etc/nginx/sites-enabled/ && systemctl reload nginx"

echo "🎉 部署完成！"
echo "🌐 游戏访问地址：http://$SERVER_HOST/gold-miner"
echo "📱 移动端访问：http://$SERVER_HOST/gold-miner"
echo "🎮 开始享受黄金矿工游戏吧！"