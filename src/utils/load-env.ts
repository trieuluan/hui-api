import path from 'path';
import { config } from 'dotenv';

/**
 * Load environment variables from a .env file based on the provided mode.
 * @param {string} [mode='development'] - The mode to load the environment variables for.
 */
export function loadEnv(mode: string = 'development') {
    if (process.env.FLY_APP_NAME || process.env.IS_FLY_IO) {
        console.log('🛫 Fly.io detected → skip loading .env');
        return;
    }

    const envPath = path.resolve(process.cwd(), `.env.${mode}`);
    const result = config({ path: envPath });

    if (result.error) {
        console.warn(`⚠️ Không thể load ${envPath}`);
    } else {
        console.log(`✅ Đã load env từ ${envPath}`);
    }
}
