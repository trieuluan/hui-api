// user.d.ts

import {ObjectId} from "fastify-mongodb";

export type UserRole = 'chuhui' | 'huivien';

export interface UserProfile {
    dob: string;              // ISO format: "YYYY-MM-DD"
    gender: 'male' | 'female' | 'other';
    address: string;
}

export type KYCStatus = 'pending' | 'verified' | 'rejected';

export interface UserKYC {
    status: KYCStatus;
    id_number?: string;
    id_type?: 'cmnd' | 'cccd' | 'passport';
    id_front_url?: string;
    id_back_url?: string;
    selfie_url?: string;
    verified_at?: Date;
}

export interface User {
    _id?: ObjectId | undefined; // MongoDB ObjectId as string
    full_name: string;
    email: string;
    phone?: string;
    password_hash: string;
    role: UserRole;
    profile?: UserProfile;
    kyc?: UserKYC;
    created_at?: Date;
    updated_at?: Date;
}
