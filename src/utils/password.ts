import zxcvbn from 'zxcvbn';
import argon2 from "argon2";
import {translateZxcvbnFeedback} from "@/utils/zxcvbn-vi";
import {appConfig} from "@/config/app_config";

export function isPasswordStrong(password: string) {
    const result = zxcvbn(password);
    const feedback = translateZxcvbnFeedback(result.feedback);
    
    // Additional validation based on config
    const config = appConfig.password;
    const additionalValidation = validatePasswordRequirements(password, config);
    
    return {
        score: result.score,
        feedback,
        isStrong: result.score >= config.minStrengthScore && additionalValidation.isValid,
        additionalValidation,
    }
}

function validatePasswordRequirements(password: string, config: any) {
    const errors: string[] = [];
    
    if (password.length < config.minLength) {
        errors.push(`Mật khẩu phải có ít nhất ${config.minLength} ký tự`);
    }
    
    if (password.length > config.maxLength) {
        errors.push(`Mật khẩu không được quá ${config.maxLength} ký tự`);
    }
    
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }
    
    if (config.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }
    
    if (config.requireNumbers && !/\d/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 số');
    }
    
    if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
    };
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