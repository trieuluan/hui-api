import { MongoClient } from 'mongodb';
import { RoleName, Permission } from '../../schemas/role.schema';

const DEFAULT_ROLES = [
  {
    name: RoleName.SUPER_ADMIN,
    description: "Super admin toàn hệ thống",
    permissions: Object.values(Permission),
  },
  {
    name: RoleName.ADMIN,
    description: "Quản trị viên hệ thống",
    permissions: [
      Permission.USER_VIEW, Permission.USER_CREATE, Permission.USER_UPDATE, Permission.USER_DELETE,
      Permission.GROUP_VIEW, Permission.GROUP_CREATE, Permission.GROUP_UPDATE, Permission.GROUP_DELETE,
      Permission.ROLE_VIEW, Permission.ROLE_CREATE, Permission.ROLE_UPDATE, Permission.ROLE_DELETE,
      Permission.FRIENDSHIP_VIEW, Permission.FRIENDSHIP_CREATE, Permission.FRIENDSHIP_UPDATE, Permission.FRIENDSHIP_DELETE,
      Permission.GROUP_MEMBER_VIEW, Permission.GROUP_MEMBER_ADD, Permission.GROUP_MEMBER_REMOVE, Permission.GROUP_MEMBER_UPDATE
    ],
  },
  {
    name: RoleName.CHU_HUI,
    description: "Chủ hụi",
    permissions: [
      Permission.GROUP_VIEW, Permission.GROUP_CREATE, Permission.GROUP_UPDATE, Permission.GROUP_DELETE,
      Permission.GROUP_MEMBER_VIEW, Permission.GROUP_MEMBER_ADD, Permission.GROUP_MEMBER_REMOVE, Permission.GROUP_MEMBER_UPDATE,
      Permission.FRIENDSHIP_VIEW, Permission.FRIENDSHIP_CREATE, Permission.FRIENDSHIP_UPDATE, Permission.FRIENDSHIP_DELETE
    ],
  },
  {
    name: RoleName.HUI_VIEN,
    description: "Hụi viên",
    permissions: [
      Permission.GROUP_VIEW, Permission.GROUP_MEMBER_VIEW, Permission.FRIENDSHIP_VIEW
    ],
  },
  {
    name: RoleName.GUEST,
    description: "Khách vãng lai",
    permissions: [
      Permission.GROUP_VIEW, Permission.GROUP_MEMBER_VIEW, Permission.FRIENDSHIP_VIEW
    ],
  },
];

export async function seedRoles(client: MongoClient) {
  const db = client.db();
  const rolesCollection = db.collection('roles');
  
  console.log('🌱 Seeding roles...');
  
  for (const role of DEFAULT_ROLES) {
    await rolesCollection.updateOne(
      { name: role.name },
      { $set: role },
      { upsert: true }
    );
    console.log(`  ✅ Role "${role.name}" synced`);
  }
  
  console.log('✅ All roles seeded successfully');
} 