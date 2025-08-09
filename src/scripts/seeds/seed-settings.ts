import { MongoClient } from 'mongodb';
import { appConfig } from '../../config/app_config';

const initialSettings = [
  {
    id: 'password_min_length',
    category: 'password',
    key: 'minLength',
    value: appConfig.password.minLength,
    description: 'Minimum password length',
  },
  {
    id: 'password_max_length',
    category: 'password',
    key: 'maxLength',
    value: appConfig.password.maxLength,
    description: 'Maximum password length',
  },
  {
    id: 'password_require_uppercase',
    category: 'password',
    key: 'requireUppercase',
    value: appConfig.password.requireUppercase,
    description: 'Require uppercase letters in password',
  },
  {
    id: 'password_require_lowercase',
    category: 'password',
    key: 'requireLowercase',
    value: appConfig.password.requireLowercase,
    description: 'Require lowercase letters in password',
  },
  {
    id: 'password_require_numbers',
    category: 'password',
    key: 'requireNumbers',
    value: appConfig.password.requireNumbers,
    description: 'Require numbers in password',
  },
  {
    id: 'password_require_special_chars',
    category: 'password',
    key: 'requireSpecialChars',
    value: appConfig.password.requireSpecialChars,
    description: 'Require special characters in password',
  },
  {
    id: 'password_min_strength_score',
    category: 'password',
    key: 'minStrengthScore',
    value: appConfig.password.minStrengthScore,
    description: 'Minimum password strength score',
  },
];

export async function seedSettings(client: MongoClient) {
  const db = client.db();
  const settingsCollection = db.collection('settings');
  
  console.log('🌱 Seeding settings...');
  
  const now = new Date();
  const settingsWithTimestamps = initialSettings.map(setting => ({
    ...setting,
    created_at: now,
    updated_at: now,
  }));
  
  // Clear existing settings and insert new ones
  await settingsCollection.deleteMany({});
  const result = await settingsCollection.insertMany(settingsWithTimestamps);
  
  console.log(`✅ Inserted ${result.insertedCount} settings`);
} 