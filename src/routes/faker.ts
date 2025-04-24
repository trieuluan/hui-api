import {FastifyPluginAsync} from "fastify";
import {groupCreateBodySchema} from "@/schemas/group.schema";
import {authMiddleware} from "@/middlewares/authMiddleware";
import {ObjectId} from "mongodb";
import {userCreateSchema} from "@/schemas/user.schema";
import {hashPassword} from "@/utils/password";
import {generateWithFaker} from "@/utils/faker-vi";
import {faker} from "@faker-js/faker/locale/vi";
import {generateE164Phone} from "@/utils/group";
import {fa} from "@faker-js/faker";

export const generateDataGroup = (ownerId: string) => {
    const totalCycles = faker.number.int({ min: 6, max: 30 });
    const maxMembers = () => {
        const total = totalCycles;
        const max = faker.number.int({ min: 1, max: 30 });
        return max > total ? total : max;
    };
    const fakerGroup = generateWithFaker(groupCreateBodySchema, {
        name: 'Dây hụi ' + faker.company.name(),
        status: 'inactive',
        ownerId: new ObjectId(ownerId),
        cycleDuration: faker.number.int({ min: 1, max: 30 }),
        totalCycles,
        maxMembers: maxMembers(),
        amountPerCycle: faker.number.int({ min: 1, max: 100 }) * 100_000,
        isPrivate: false,
        autoStart: false
    });
    delete fakerGroup.startDate;
    delete fakerGroup.endDate;
    delete fakerGroup.password;
    return fakerGroup;
}

const fakerRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onRequest', authMiddleware);
    fastify.get('/faker-group', async (request, reply) => {
        let result;
        let insertData;
        do {
            result = groupCreateBodySchema.safeParse(generateDataGroup(request.auth.user!.id));
        } while (result.error);
        if (result.success) {
            insertData = await fastify.groupModel.createGroup(result.data);
        }
        reply.status(200).send(insertData);
    });

    fastify.get('/faker-members', async (request, reply) => {
        const password_hash = await hashPassword('123456');
        const result = userCreateSchema.safeParse(generateWithFaker(userCreateSchema, {
            full_name: faker.person.fullName(),
            phone: generateE164Phone(),
            password_hash,
            role: 'huivien',
            kyc: {
                status: 'pending',
            },
            profile: {
                dob: faker.date.birthdate({
                    mode: 'age', min: 18, max: 65
                }).toISOString().split('T')[0],
                gender: faker.helpers.arrayElement(["male", "female", "other"]),
                address: faker.location.streetAddress(),
            }
        }));
        if (result.error) {
            reply.status(400).send(result.error);
            return;
        }
        const insertData = await fastify.userModel.createUser(result.data);
        reply.status(200).send(insertData);
    });
}

export default fakerRoutes;