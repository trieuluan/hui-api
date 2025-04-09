import zxcvbn from 'zxcvbn';
import argon2 from "argon2";
import {translateZxcvbnFeedback} from "@/utils/zxcvbn-vi";

export function isPasswordStrong(password: string) {
    const result = zxcvbn(password);
    const feedback = translateZxcvbnFeedback(result.feedback);
    return {
        score: result.score,
        feedback,
    }
}

export async function hashPassword(plain: string): Promise<string> {
    try {
        return await argon2.hash(plain);
    } catch (err) {
        console.error("Password hashing failed:", err);
        throw new Error("Password hashing failed");
    }
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
    try {
        return await argon2.verify(hashed, plain);
    } catch (err) {
        console.error("Password verification failed:", err);
        return false;
    }
}