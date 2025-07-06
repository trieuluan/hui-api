import { MongoClient } from "mongodb";
import {Lucia, TimeSpan} from "lucia";
import {CustomMongodbAdapter} from "@/lib/custom-mongodb-adapter";

const client = new MongoClient(process.env.MONGODB_URI! || "mongodb://localhost:27017/hui");
await client.connect();
const db = client.db();

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
        console.log("getUserAttributes", data);
        return {
            id: data._id,
            email: data.email,
            role: data.role,
            full_name: data.full_name,
            permissions: data.permissions || [],
        };
    },
    getSessionAttributes: (data: any) => {
        return {
            permissions: data.permissions || [],
        };
    },
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
    }
}