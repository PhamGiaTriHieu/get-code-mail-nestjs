# run Bun
# Stage 1: Build bằng Bun (Cực nhanh, tốn ít CPU)
FROM oven/bun:1-alpine AS builder

WORKDIR /usr/src/app

COPY package.json bun.lock* bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: Runtime bằng Node 20
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./
# Cài đặt production dependencies
RUN npm install --only=production --legacy-peer-deps

# Copy thư mục dist đã được build ở stage trước
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]

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