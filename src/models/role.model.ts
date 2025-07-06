import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import { Role, RoleName, Permission } from "@/schemas/role.schema";

const DEFAULT_ROLES: Omit<Role, '_id'>[] = [
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
    permissions: [],
  },
];

export class RoleModel {
  private fi: FastifyInstance;

  constructor(fi: FastifyInstance) {
    this.fi = fi;
  }

  private collection() {
    return this.fi.mongo.db!.collection("roles");
  }

  async ensureDefaultRoles() {
    for (const role of DEFAULT_ROLES) {
      await this.collection().updateOne(
        { name: role.name },
        { $set: role },
        { upsert: true }
      );
    }
    this.fi.log.info("✅ Synced default roles (upsert)");
  }

  async findByName(name: RoleName): Promise<Role | null> {
    return this.collection().findOne({ name }) as Promise<Role | null>;
  }

  async list(): Promise<Role[]> {
    return this.collection().find().toArray() as Promise<Role[]>;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    roleModel: RoleModel;
  }
}
