# run Bun
FROM oven/bun:1-alpine

WORKDIR /usr/src/app

# Copy file package và bun.lockb (hoặc package.json)
COPY package.json bun.lockb* ./

# Cài đặt bằng Bun (nhanh gấp nhiều lần npm)
RUN bun install --frozen-lockfile

COPY . .

# Build NestJS
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "dist/main.js"]

# FROM node:20-alpine 

# WORKDIR /usr/src/app

# COPY package*.json ./

# # Cài đặt dependencies chuẩn
# RUN npm install

# COPY . .

# # Build ứng dụng NestJS
# RUN npm run build

# # Prune devDependencies mượt mà không bị ngắt
# RUN npm prune --production

# EXPOSE 3000

# CMD ["node", "dist/main"]