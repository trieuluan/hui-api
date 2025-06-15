import {FastifyPluginAsync} from "fastify";
import {groupSchema} from "@/schemas/group.schema";
import {userCreateSchema} from "@/schemas/user.schema";
import {patchObjectIdFieldsRecursive, zodToMongoJsonSchema} from "@/utils/zod-to-mongo-schema";

const mongoSchemaInit: FastifyPluginAsync = async (fastify) => {
    const db = fastify.mongo.db!;
    const collections = await db.listCollections().toArray();
    const existingNames = collections.map((c) => c.name);

    const ensureCollection = async (name: string, validator: object) => {
        if (!existingNames.includes(name)) {
            await db.createCollection(name, {
                validator: {
                    $jsonSchema: validator
                },
                validationLevel: 'strict',
                validationAction: 'error',
            });
            fastify.log.info(`✅ Created collection "${name}" with validation`);
        } else {
            try {
                await db.command({
                    collMod: name,
                    validator: {
                        $jsonSchema: validator
                    },
                    validationLevel: 'strict',
                    validationAction: 'error',
                });
                fastify.log.info(`🛠️ Updated validator for "${name}"`);
            } catch (e: any) {
                fastify.log.warn(`⚠️ Could not update validator for "${name}": ${e.message}`);
            }
        }
    };

    const groupJsonSchema = zodToMongoJsonSchema(groupSchema);
    patchObjectIdFieldsRecursive(groupJsonSchema, ['_id', 'ownerId', 'deletedBy', 'createdBy']);
    await ensureCollection('groups', groupJsonSchema);
    await db.collection('groups').createIndexes([
        { key: { code: 1 }, name: 'code_unique_index', unique: true, sparse: true },
        { key: { ownerId: 1 }, name: 'owner_index' },
        { key: { status: 1 }, name: 'status_index' },
        { key: { ownerId: 1, status: 1 }, name: 'owner_status_index' },
        { key: { createdAt: -1 }, name: 'createdAt_index' },
    ]);

    const userJsonSchema = zodToMongoJsonSchema(userCreateSchema);
    await ensureCollection('users', userJsonSchema);
}

export default mongoSchemaInit;