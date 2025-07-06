import { FastifyRequest, FastifyReply } from "fastify";
import { Permission } from "@/schemas/role.schema";

export function authorize(permissions: Permission[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.auth?.user || (request.user as any);
    if (!user || !user.permissions) {
      return reply.status(403).send({ message: "Forbidden: No permissions" });
    }
    const hasAll = permissions.every((perm) => user.permissions.includes(perm));
    if (!hasAll) {
      return reply.status(403).send({ message: "Forbidden: Insufficient permissions" });
    }
  };
}
