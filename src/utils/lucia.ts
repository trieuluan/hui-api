import { MongoClient } from "mongodb";
import {Lucia, TimeSpan} from "lucia";
import {CustomMongodbAdapter} from "@/lib/custom-mongodb-adapter";

const client = new MongoClient(process.env.MONGODB_URI! || "mongodb://localhost:27017");
await client.connect();
const db = client.db("hui");

const adapter = CustomMongodbAdapter(db.collection("users"), db.collection("sessions"));

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === "production", // change to true in production
            path: "/",
            sameSite: "lax",
        },
        expires: true,
    },
    sessionExpiresIn: new TimeSpan(30, "d"),
    getUserAttributes: (data: any) => {
        return {
            id: data._id,
            email: data.email,
            role: data.role,
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
    }
}