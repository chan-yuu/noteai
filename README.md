# 构建
docker compose build --no-cache
# 启动
docker compose up -d
进入
# 停止
docker compose stop
# 彻底清理
docker compose down



docker system prune -af
docker builder prune -af
docker system df