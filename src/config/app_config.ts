export interface AppConfig {
  password: {
    minStrengthScore: number;
    maxLength: number;
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  auth: {
    otpExpiryMinutes: number;
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
  };
  server: {
    port: number;
    host: string;
    cors: {
      origin: string[];
      credentials: boolean;
    };
  };
}

export const defaultConfig: AppConfig = {
  password: {
    minStrengthScore: 2, // Zxcvbn score threshold
    maxLength: 128,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false, // Optional for better UX
  },
  auth: {
    otpExpiryMinutes: 5,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:8080'],
      credentials: true,
    },
  },
};

// Load config from environment variables
export function loadConfig(): AppConfig {
  return {
    password: {
      minStrengthScore: parseInt(process.env.PASSWORD_MIN_STRENGTH_SCORE || '2'),
      maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '128'),
      minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
      requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
      requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
      requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === 'true',
    },
    auth: {
      otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5'),
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
      lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15'),
    },
    server: {
      port: parseInt(process.env.PORT || '3000'),
      host: process.env.HOST || '0.0.0.0',
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
        credentials: process.env.CORS_CREDENTIALS !== 'false',
      },
    },
  };
}

// Global config instance
export const appConfig = loadConfig(); 