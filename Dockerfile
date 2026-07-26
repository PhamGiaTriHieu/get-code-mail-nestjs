FROM node:20-alpine 

WORKDIR /usr/src/app

COPY package*.json ./

# Cài đặt dependencies chuẩn
RUN npm install

COPY . .

# Build ứng dụng NestJS
RUN npm run build

# Prune devDependencies mượt mà không bị ngắt
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/main"]