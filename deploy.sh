#!/bin/bash

# 黄金矿工游戏部署脚本
# 用于部署到阿里云服务器

echo "🚀 开始部署黄金矿工游戏到阿里云服务器..."

# 服务器配置（请根据实际情况修改）
SERVER_HOST="your-server-ip"
SERVER_USER="root"
SERVER_PATH="/var/www/gold-miner"
SERVER_PORT="22"

# 检查必要文件
if [ ! -f "index.html" ] || [ ! -f "script.js" ] || [ ! -f "style.css" ]; then
    echo "❌ 错误：缺少必要的游戏文件"
    exit 1
fi

echo "📦 准备上传文件..."

# 创建临时目录
TEMP_DIR="/tmp/gold-miner-deploy"
mkdir -p $TEMP_DIR

# 复制文件到临时目录
cp index.html script.js style.css README.md $TEMP_DIR/

echo "📤 上传文件到服务器..."

# 使用scp上传文件（需要配置SSH密钥或输入密码）
scp -P $SERVER_PORT -r $TEMP_DIR/* $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

if [ $? -eq 0 ]; then
    echo "✅ 文件上传成功！"
else
    echo "❌ 文件上传失败！"
    exit 1
fi

# 设置服务器上的文件权限
echo "🔧 设置文件权限..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "chmod -R 755 $SERVER_PATH && chown -R www-data:www-data $SERVER_PATH"

# 重启Nginx（如果需要）
echo "🔄 重启Web服务器..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "systemctl reload nginx"

# 清理临时文件
rm -rf $TEMP_DIR

echo "🎉 部署完成！"
echo "🌐 游戏地址：http://$SERVER_HOST/gold-miner"
echo "📝 请确保："
echo "   1. 服务器已安装Nginx"
echo "   2. 已配置域名解析（如果使用域名）"
echo "   3. 防火墙已开放80/443端口"