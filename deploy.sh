#!/bin/bash

# 黄金矿工游戏 - 通用部署脚本
# 使用环境变量配置服务器信息，避免在代码中暴露敏感信息

echo "🎮 开始部署黄金矿工游戏..."

# 检查必要的环境变量
if [ -z "$DEPLOY_HOST" ] || [ -z "$DEPLOY_USER" ] || [ -z "$DEPLOY_PATH" ]; then
    echo "❌ 请设置以下环境变量："
    echo "   export DEPLOY_HOST=your_server_ip"
    echo "   export DEPLOY_USER=your_username"
    echo "   export DEPLOY_PATH=/var/www/html/gold-miner"
    echo "   export DEPLOY_PORT=80  # 可选，默认80端口"
    exit 1
fi

# 设置默认端口
DEPLOY_PORT=${DEPLOY_PORT:-80}

# GitHub仓库地址
GITHUB_REPO="https://github.com/wangyong-chengdu/gold-miner.git"

echo "📦 从GitHub克隆/更新代码到服务器..."
echo "🌐 目标服务器: $DEPLOY_HOST"
echo "📁 部署路径: $DEPLOY_PATH"
echo "🚪 服务端口: $DEPLOY_PORT"

# 在服务器上克隆或更新代码
ssh $DEPLOY_USER@$DEPLOY_HOST "
    if [ -d '$DEPLOY_PATH' ]; then
        echo '📁 目录已存在，更新代码...'
        cd $DEPLOY_PATH && git pull origin main
    else
        echo '📁 克隆新仓库...'
        git clone $GITHUB_REPO $DEPLOY_PATH
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
ssh $DEPLOY_USER@$DEPLOY_HOST "chmod -R 755 $DEPLOY_PATH"

# 创建Nginx配置（如果不存在）
echo "⚙️ 配置Web服务器..."
ssh $DEPLOY_USER@$DEPLOY_HOST "cat > /etc/nginx/sites-available/gold-miner << 'EOF'
server {
    listen $DEPLOY_PORT;
    server_name _;
    
    location /gold-miner {
        alias $DEPLOY_PATH;
        index index.html;
        try_files \$uri \$uri/ =404;
        
        # 添加MIME类型支持
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control \"public, immutable\";
        }
    }
    
    # 根路径重定向到游戏
    location = / {
        return 301 /gold-miner/;
    }
}
EOF"

# 启用站点并重启Nginx
ssh $DEPLOY_USER@$DEPLOY_HOST "ln -sf /etc/nginx/sites-available/gold-miner /etc/nginx/sites-enabled/ && systemctl reload nginx"

echo "🎉 部署完成！"
echo "🌐 游戏访问地址：http://$DEPLOY_HOST:$DEPLOY_PORT/gold-miner"
echo "📱 移动端访问：http://$DEPLOY_HOST:$DEPLOY_PORT/gold-miner"
echo "🎮 开始享受黄金矿工游戏吧！"

echo ""
echo "💡 使用说明："
echo "   1. 设置环境变量后运行此脚本"
echo "   2. 确保服务器已安装git和nginx"
echo "   3. 确保SSH密钥已配置或可以密码登录"