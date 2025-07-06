# Sử dụng node image nhẹ
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và cài đặt trước
COPY package.json package-lock.json* ./

# Cài production-only packages
RUN npm install --omit=dev

# Copy source vào container
COPY dist ./dist

EXPOSE 3000

# Chạy production
CMD ["npm", "start"]