import { z } from "zod";
import { ObjectId } from "mongodb";

export enum RoleName {
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
  GUEST = "guest",
  CHU_HUI = "chu_hui",
  HUI_VIEN = "hui_vien",
}

export enum Permission {
  // User
  USER_VIEW = "user:view",
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",

  // Group
  GROUP_VIEW = "group:view",
  GROUP_CREATE = "group:create",
  GROUP_UPDATE = "group:update",
  GROUP_DELETE = "group:delete",

  // Group Member
  GROUP_MEMBER_VIEW = "group_member:view",
  GROUP_MEMBER_ADD = "group_member:add",
  GROUP_MEMBER_REMOVE = "group_member:remove",
  GROUP_MEMBER_UPDATE = "group_member:update",

  // Friendship
  FRIENDSHIP_VIEW = "friendship:view",
  FRIENDSHIP_CREATE = "friendship:create",
  FRIENDSHIP_UPDATE = "friendship:update",
  FRIENDSHIP_DELETE = "friendship:delete",

  // Counter
  COUNTER_VIEW = "counter:view",
  COUNTER_UPDATE = "counter:update",

  // Role
  ROLE_VIEW = "role:view",
  ROLE_CREATE = "role:create",
  ROLE_UPDATE = "role:update",
  ROLE_DELETE = "role:delete",
}

export const roleSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.nativeEnum(RoleName),
  description: z.string().optional(),
  permissions: z.array(z.nativeEnum(Permission)).optional(),
});

export type Role = z.infer<typeof roleSchema>;
