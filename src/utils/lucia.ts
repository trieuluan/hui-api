import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import { MongoClient } from "mongodb";
import {Lucia} from "lucia";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
const db = client.db("hui");

const adapter = new MongodbAdapter(
    db.collection("sessions"),
    db.collection("users"),
);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === "production", // change to true in production
            path: "/",
            sameSite: "lax",
        },
    },
});

export type Auth = typeof lucia;