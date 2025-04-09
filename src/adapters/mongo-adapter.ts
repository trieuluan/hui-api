import { Db } from "mongodb";
import {Adapter, DatabaseSession, DatabaseUser} from "lucia";

export const MongoAdapter = (db: Db): Adapter => {
    const userCollection = db.collection("users");
    const sessionCollection = db.collection("sessions");

    return {
        async getSessionAndUser(sessionId): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
            const session = await sessionCollection.findOne({ _id: sessionId });
            if (!session) return [null, null];

            const user = await userCollection.findOne({ _id: session.userId });
            if (!user) return [null, null];

            return [
                {
                    id: session._id.toString(),
                    userId: session.userId,
                    expiresAt: session.expiresAt,
                    attributes: session.attributes || {}
                },
                {
                    id: user._id.toString(),
                    attributes: user.attributes || {}
                }
            ];
        },
        async getUserSessions(userId): Promise<DatabaseSession[]> {
            const sessions = await sessionCollection.find({ userId }).toArray();
            return sessions.map((session) => ({
                id: session._id,
                userId: session.userId,
                expiresAt: session.expiresAt,
                attributes: session.attributes || {}
            })) as any;
        },
        async setSession(session) {
            await sessionCollection.insertOne({
                _id: session.id as any,
                userId: session.userId,
                expiresAt: session.expiresAt,
                attributes: session.attributes || {}
            });
        },
        async updateSessionExpiration(sessionId, expiresAt) {
            await sessionCollection.updateOne(
                { _id: sessionId },
                { $set: { expiresAt } }
            );
        },
        async deleteSession(sessionId) {
            await sessionCollection.deleteOne({ _id: sessionId });
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
