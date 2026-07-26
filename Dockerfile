# 1. Cập nhật lên Node 20 để khớp với các thư viện hiện tại
FROM node:20-alpine 

WORKDIR /usr/src/app

COPY package*.json ./

# 2. Cài đặt các gói phụ thuộc (bỏ qua peer-deps và cảnh báo engine)
RUN npm install --legacy-peer-deps --engine-strict=false

COPY . .

# 3. Build ứng dụng NestJS
RUN npm run build

# 4. Dọn dẹp devDependencies để giảm kích thước image và tăng tốc
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/main"]