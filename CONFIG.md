# Configuration Guide

## Environment Variables

### Server Configuration
```bash
PORT=3000                    # Server port
HOST=0.0.0.0                # Server host
```

### CORS Configuration
```bash
CORS_ORIGIN=http://localhost:3000,http://localhost:8080  # Allowed origins
CORS_CREDENTIALS=true       # Allow credentials
```

### Password Configuration
```bash
PASSWORD_MIN_STRENGTH_SCORE=2    # Zxcvbn score threshold (0-4)
PASSWORD_MAX_LENGTH=128          # Maximum password length
PASSWORD_MIN_LENGTH=8            # Minimum password length
PASSWORD_REQUIRE_UPPERCASE=true  # Require uppercase letters
PASSWORD_REQUIRE_LOWERCASE=true  # Require lowercase letters
PASSWORD_REQUIRE_NUMBERS=true    # Require numbers
PASSWORD_REQUIRE_SPECIAL_CHARS=false  # Require special characters
```

### Authentication Configuration
```bash
OTP_EXPIRY_MINUTES=5        # OTP expiration time
MAX_LOGIN_ATTEMPTS=5        # Max failed login attempts
LOCKOUT_DURATION_MINUTES=15 # Account lockout duration
```

## Password Strength Levels

| Score | Level | Description | Example |
|-------|-------|-------------|---------|
| 0 | Very Weak | Trong 10^3 guesses | `123456`, `password` |
| 1 | Weak | Trong 10^6 guesses | `abc123`, `qwerty` |
| 2 | Fair | Trong 10^8 guesses | `Centro12`, `MyPass1` |
| 3 | Good | Trong 10^10 guesses | `MySecurePass123!` |
| 4 | Strong | Trong 10^12+ guesses | `K8s!mN2$pL9#vX7@` |

## Recommended Settings

### For Development
```bash
PASSWORD_MIN_STRENGTH_SCORE=1
PASSWORD_REQUIRE_SPECIAL_CHARS=false
```

### For Production
```bash
PASSWORD_MIN_STRENGTH_SCORE=2
PASSWORD_REQUIRE_SPECIAL_CHARS=false
```

### For High Security
```bash
PASSWORD_MIN_STRENGTH_SCORE=3
PASSWORD_REQUIRE_SPECIAL_CHARS=true
```

## API Response Format

### Password Strength Check
```json
{
  "score": 2,
  "feedback": {
    "warning": "This is a very common password",
    "suggestions": ["Add another word or two", "Use a longer keyboard pattern"]
  },
  "isStrong": true,
  "additionalValidation": {
    "isValid": true,
    "errors": []
  },
  "config": {
    "minStrengthScore": 2,
    "minLength": 8,
    "maxLength": 128,
    "requirements": {
      "uppercase": true,
      "lowercase": true,
      "numbers": true,
      "specialChars": false
    }
  }
}
``` 