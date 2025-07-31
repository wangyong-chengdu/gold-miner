# 黄金矿工游戏部署指南

## 快速部署

本项目提供了通用的部署脚本 `deploy.sh`，支持部署到任何Linux服务器。

### 1. 环境准备

在运行部署脚本前，请确保：

- 目标服务器已安装 `git` 和 `nginx`
- 已配置SSH密钥或可以密码登录
- 服务器防火墙已开放相应端口

### 2. 设置环境变量

```bash
# 必需的环境变量
export DEPLOY_HOST=your_server_ip        # 服务器IP地址
export DEPLOY_USER=your_username         # SSH用户名
export DEPLOY_PATH=/var/www/html/gold-miner  # 部署路径

# 可选的环境变量
export DEPLOY_PORT=80                    # Web服务端口，默认80
```

### 3. 运行部署脚本

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 4. 访问游戏

部署完成后，可通过以下地址访问：

- **游戏地址**: `http://your_server_ip:port/gold-miner`
- **移动端**: 同样地址，自适应移动设备

## 部署示例

### 示例1：部署到阿里云ECS

```bash
# 设置环境变量
export DEPLOY_HOST=47.115.230.75
export DEPLOY_USER=root
export DEPLOY_PATH=/var/www/html/gold-miner
export DEPLOY_PORT=80

# 执行部署
./deploy.sh
```

### 示例2：部署到腾讯云CVM

```bash
# 设置环境变量
export DEPLOY_HOST=your_tencent_cloud_ip
export DEPLOY_USER=ubuntu
export DEPLOY_PATH=/var/www/html/gold-miner
export DEPLOY_PORT=8080

# 执行部署
./deploy.sh
```

## 本地开发

如需本地开发和测试：

```bash
# 启动本地服务器
python3 -m http.server 8080

# 访问地址
http://localhost:8080
```

## 故障排除

### 常见问题

1. **SSH连接失败**
   - 检查服务器IP和用户名是否正确
   - 确认SSH密钥已正确配置
   - 检查服务器防火墙设置

2. **Nginx配置失败**
   - 确认用户有sudo权限
   - 检查Nginx是否已安装
   - 查看Nginx错误日志：`sudo tail -f /var/log/nginx/error.log`

3. **Git克隆失败**
   - 检查服务器网络连接
   - 确认服务器已安装git
   - 检查GitHub仓库访问权限

### 手动部署步骤

如果自动部署失败，可以手动执行以下步骤：

```bash
# 1. 登录服务器
ssh user@your_server_ip

# 2. 克隆代码
git clone https://github.com/wangyong-chengdu/gold-miner.git /var/www/html/gold-miner

# 3. 设置权限
chmod -R 755 /var/www/html/gold-miner

# 4. 配置Nginx
sudo nano /etc/nginx/sites-available/gold-miner
# 复制脚本中的Nginx配置

# 5. 启用站点
sudo ln -sf /etc/nginx/sites-available/gold-miner /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

## 技术栈

- **前端**: HTML5 Canvas + JavaScript ES6+
- **样式**: CSS3 + 响应式设计
- **部署**: Nginx + Git
- **兼容性**: 现代浏览器 + 移动设备

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件