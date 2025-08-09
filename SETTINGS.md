# Settings System

Hệ thống quản lý cấu hình động cho Hụi API.

## 🎯 Tổng quan

Settings system cho phép thay đổi cấu hình mà không cần deploy lại code. Hệ thống sử dụng database để lưu trữ và cache để tối ưu performance.

## 🏗️ Kiến trúc

### Components:
- **Settings Model**: Interface và logic database
- **Settings Service**: Business logic với caching
- **Settings Plugin**: Fastify plugin để inject service
- **Settings Routes**: API endpoints để quản lý settings

### Database Schema:
```sql
settings collection:
{
  _id: ObjectId,
  id: "password_min_length",           // Unique identifier
  category: "password",                // Group settings
  key: "minLength",                    // Setting key
  value: 8,                           // Setting value (JSON)
  description: "Minimum password length",
  created_at: Date,
  updated_at: Date
}
```

## 🚀 Setup

### 1. Seed initial settings:
```bash
npm run seed:settings
```

### 2. Verify settings in database:
```bash
# Connect to MongoDB
mongosh
use hui
db.settings.find()
```

## 📚 API Endpoints

### Public Endpoints (không cần auth):
- `GET /auth/password-config` - Lấy password configuration

### Admin Endpoints (cần auth):
- `GET /settings/:category` - Lấy tất cả settings theo category
- `GET /settings/:category/:key` - Lấy setting cụ thể
- `PATCH /settings/:category/:key` - Cập nhật setting
- `POST /settings` - Tạo setting mới

## 🔧 Usage Examples

### 1. Lấy password config:
```bash
curl http://localhost:3000/auth/password-config
```

Response:
```json
{
  "minStrengthScore": 3,
  "minLength": 8,
  "maxLength": 128,
  "requirements": {
    "uppercase": true,
    "lowercase": true,
    "numbers": true,
    "specialChars": false
  }
}
```

### 2. Cập nhật password min length:
```bash
curl -X PATCH http://localhost:3000/settings/password/minLength \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": 10}'
```

### 3. Lấy tất cả password settings:
```bash
curl http://localhost:3000/settings/password \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎨 Categories

### Password Settings:
- `password_min_length` - Minimum password length
- `password_max_length` - Maximum password length
- `password_require_uppercase` - Require uppercase letters
- `password_require_lowercase` - Require lowercase letters
- `password_require_numbers` - Require numbers
- `password_require_special_chars` - Require special characters
- `password_min_strength_score` - Minimum strength score

### Future Categories:
- `security` - Security settings
- `ui` - UI configurations
- `business` - Business rules
- `feature_flags` - Feature toggles

## ⚡ Performance

### Caching:
- **TTL**: 5 minutes
- **Strategy**: In-memory cache với expiry
- **Invalidation**: Tự động khi update setting

### Fallback:
- Nếu database fails → sử dụng config từ code
- Nếu cache miss → query database và cache lại

## 🔒 Security

### Access Control:
- Public endpoints: Chỉ đọc, không cần auth
- Admin endpoints: Cần authentication và authorization
- Settings routes: Chỉ admin có thể thay đổi

### Validation:
- Zod schema validation cho tất cả inputs
- Type checking cho setting values
- Sanitization cho user inputs

## 🛠️ Development

### Adding new settings:
1. Thêm vào `seed-settings.ts`
2. Chạy `npm run seed:settings`
3. Update API logic nếu cần

### Testing:
```bash
# Test password config endpoint
curl http://localhost:3000/auth/password-config

# Test admin endpoints (cần token)
curl http://localhost:3000/settings/password
```

## 📝 Notes

- Settings được cache 5 phút để tối ưu performance
- Fallback về config từ code nếu database fails
- Tất cả changes được audit (created_at, updated_at)
- Settings có thể được group theo categories 