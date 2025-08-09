# Database Seeding System

Hệ thống seeding dữ liệu mặc định cho Hụi API.

## 🎯 Tổng quan

Seeding system giúp khởi tạo dữ liệu cần thiết cho ứng dụng khi lần đầu chạy hoặc khi cần reset database.

## 🏗️ Kiến trúc

### Scripts:
- **`seed-all.ts`**: Seed tất cả dữ liệu (roles, counters, settings)
- **`check-and-seed.ts`**: Check database state và seed nếu cần

### Seeds Modules:
- **`seeds/seed-roles.ts`**: Logic seeding roles
- **`seeds/seed-counters.ts`**: Logic seeding counters
- **`seeds/seed-settings.ts`**: Logic seeding settings
- **`seeds/index.ts`**: Export tất cả seed functions

### Data được seed:
1. **Roles**: SUPER_ADMIN, ADMIN, CHU_HUI, HUI_VIEN, GUEST
2. **Counters**: groupCode counter cho generate unique codes
3. **Settings**: Password configuration từ appConfig

## 🚀 Usage

### 1. Check và seed tự động (Recommended):
```bash
npm run seed:check
```

### 2. Force seed tất cả:
```bash
npm run seed:all
```



## 📊 Database State Check

Script `check-and-seed.ts` sẽ kiểm tra:

```typescript
// Check collections
const rolesCount = await db.collection('roles').countDocuments();
const countersCount = await db.collection('counters').countDocuments();
const settingsCount = await db.collection('settings').countDocuments();

// Seed if any collection is empty
const needsSeeding = rolesCount === 0 || countersCount === 0 || settingsCount === 0;
```

## 🎨 Data Structure

### Roles Collection:
```json
{
  "_id": ObjectId,
  "name": "SUPER_ADMIN",
  "description": "Super admin toàn hệ thống",
  "permissions": ["USER_VIEW", "USER_CREATE", ...]
}
```

### Counters Collection:
```json
{
  "_id": "groupCode",
  "seq": 0
}
```

### Settings Collection:
```json
{
  "_id": ObjectId,
  "id": "password_min_length",
  "category": "password",
  "key": "minLength",
  "value": 8,
  "description": "Minimum password length",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## 🔄 Startup Behavior

### Trước đây (trong mongodb plugin):
```typescript
// Tự động chạy khi startup
await roleModel.ensureDefaultRoles();
await counterModel.init();
```

### Bây giờ (tách riêng):
```typescript
// Chỉ decorate models, không tự động seed
fastify.decorate("roleModel", new RoleModel(fastify));
fastify.decorate("counterModel", new CounterModel(fastify));
```

## ⚡ Performance Benefits

### Startup Time:
- **Trước**: Startup chậm do phải seed data
- **Sau**: Startup nhanh, chỉ decorate models

### Flexibility:
- **Trước**: Luôn seed khi startup
- **Sau**: Có thể chọn khi nào seed

### Control:
- **Trước**: Không thể skip seeding
- **Sau**: Có thể skip trong production

## 🛠️ Development Workflow

### First Time Setup:
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.development

# 3. Seed database
npm run seed:check

# 4. Start development
npm run dev
```

### Adding New Seed Data:
1. Tạo file mới trong `seeds/` folder (e.g., `seeds/seed-users.ts`)
2. Export function từ `seeds/index.ts`
3. Import và sử dụng trong `seed-all.ts`
4. Update `check-and-seed.ts` để check collection mới
5. Test với `npm run seed:all`

### Production Deployment:
```bash
# Build
npm run build

# Seed production database
npm run seed:check

# Start
npm start
```

## 🔒 Safety Features

### Upsert Strategy:
- Roles: `upsert: true` - Không overwrite existing data
- Counters: `$setOnInsert` - Chỉ insert nếu chưa có
- Settings: `deleteMany` + `insertMany` - Reset to defaults

### Environment Awareness:
- Load environment variables
- Use correct database URI
- Handle errors gracefully

## 📝 Notes

- Seeding scripts có thể chạy độc lập
- Database state được check trước khi seed
- Tất cả scripts đều có error handling
- Logs rõ ràng cho debugging
- Có thể chạy multiple lần safely 