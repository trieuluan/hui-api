#!/bin/bash

ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ File $ENV_FILE không tồn tại!"
  exit 1
fi

echo "📦 Đang nạp secrets từ $ENV_FILE vào Fly.io..."

# Dòng không comment + không rỗng → gửi lên fly
cat "$ENV_FILE" | grep -v '^#' | grep -v '^\s*$' | xargs fly secrets set

echo "✅ Đã nạp xong tất cả secrets!"
