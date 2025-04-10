import type { Adapter, DatabaseUser, DatabaseSession } from "lucia";
import { Collection, ObjectId } from "mongodb";

export const CustomMongodbAdapter = (
    userCollection: Collection,
    sessionCollection: Collection<DatabaseSession>
): Adapter => {
    return {
        async getSessionAndUser(sessionId): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
            const session = await sessionCollection.findOne({ id: sessionId });
            if (!session) return [null, null];
            const user = await userCollection.findOne({ _id: new ObjectId(session.userId) });
            if (!user) return [null, null];
            const { _id, ...userData } = user;

            return [
                {
                    id: session._id.toString(),
                    userId: session.userId,
                    expiresAt: session.expiresAt,
                    attributes: session.attributes || {}
                },
                {
                    id: user._id.toString(),
                    attributes: userData || {}
                }
            ];
        },
        async getUserSessions(userId): Promise<DatabaseSession[]> {
            const sessions = await sessionCollection.find({ userId }).toArray();
            return sessions.map((session) => ({
                id: session.id,
                userId: session.userId,
                expiresAt: session.expiresAt,
                attributes: session.attributes || {}
            })) as any;
        },
        async setSession(session) {
            await sessionCollection.insertOne({
                id: session.id,
                userId: session.userId,
                expiresAt: session.expiresAt,
                attributes: session.attributes || {}
            });
        },
        async updateSessionExpiration(sessionId, expiresAt) {
            await sessionCollection.updateOne(
                { id: sessionId },
                { $set: { expiresAt } }
            );
        },
        async deleteSession(sessionId) {
            await sessionCollection.deleteOne({ id: sessionId });
        },
        async deleteUserSessions(userId) {
            await sessionCollection.deleteMany({ userId });
        },
        async deleteExpiredSessions() {
            await sessionCollection.deleteMany({
                expiresAt: { $lte: new Date() }
            });
        }
    };
};
