import { FastifyInstance } from "fastify";
import {ObjectId} from "mongodb";
import {User} from "@/schemas/user.schema";

export class UserModel {
    private fi: FastifyInstance;

    constructor(fi: FastifyInstance) {
        this.fi = fi;
    }

    private collection() {
        return this.fi.mongo.db!.collection("users");
    }

    private async mapPermissions(user: User): Promise<User | null> {
        if (!user) return null;
        const role = await this.fi.roleModel.findByName(user.role);
        return { ...user, permissions: role?.permissions || [] };
    }

    getUserCollection = () => {
        return this.collection();
    }

    createUser = async (user: User): Promise<User> => {
        const result = await this.collection().insertOne(user);
        return this.mapPermissions({ ...user, _id: result.insertedId }) as Promise<User>;
    }

    async findById(id: string | ObjectId): Promise<User | null> {
        const result = await this.collection().findOne({ _id: new ObjectId(id) });
        if (!result) {
            return null;
        }
        return this.mapPermissions(result as User);
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await this.collection().findOne({ email });
        if (!result) {
            return null;
        }
        return this.mapPermissions(result as User);
    }

    async findByPhone(phone: string): Promise<User | null> {
        const result = await this.collection().findOne({ phone });
        if (!result) {
            return null;
        }
        return this.mapPermissions(result as User);
    }

    async updateById(id: string | ObjectId, data: Partial<User>) {
        return this.collection().updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...data,
                    updated_at: new Date()
                }
            }
        );
    }

    async deleteById(id: string | ObjectId) {
        return this.collection().deleteOne({ _id: new ObjectId(id) });
    }

    async list(filter: Partial<User> = {}): Promise<User[]> {
        return await this.collection().find(filter).toArray() as User[];
    }

    async existsByEmailOrPhone(emailOrPhone: string): Promise<User | null> {
        const user = await this.collection().findOne({
            $or: [
                { email: emailOrPhone },
                { phone: emailOrPhone }
            ]
        });
        return this.mapPermissions(user as User);
    }
}

declare module "fastify" {
    interface FastifyInstance {
        userModel: UserModel;
    }
}