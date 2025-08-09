# Hụi API

A robust RESTful API for managing "Hụi" - a rotating savings and credit association (ROSCA) system. Built with modern TypeScript and Fastify.

## 🚀 Features

- **User Management**: Registration, authentication, and profile management
- **Group Management**: Create, join, and manage Hụi groups
- **Member Management**: Track group memberships and contributions
- **Friendship System**: Connect with other users
- **Internationalization**: Supports multiple languages (English, Vietnamese)
- **API Documentation**: Interactive Swagger documentation
- **Security**: JWT authentication, password hashing with Argon2, and password strength validation

## 🛠️ Technologies

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Fastify
- **Database**: MongoDB
- **Authentication**: Lucia Auth, JWT
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Internationalization**: i18next
- **Security**: Argon2, zxcvbn

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hui-api.git
   cd hui-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment files:
   ```bash
   # For development
   cp .env.example .env.development
   
   # For production
   cp .env.example .env.production
   ```

4. Configure environment variables in the created files:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/hui
   JWT_SECRET=your_jwt_secret
   ```

## 🚀 Running the Application

### Development Mode

```bash
# First time setup - seed database
npm run seed:check

# Start development server
npm run dev
```

The server will start on the port specified in your environment file (default: 3000).
API documentation will be available at: http://localhost:3000/docs

### Database Seeding

```bash
# Check and seed if needed (recommended)
npm run seed:check

# Force seed all data
npm run seed:all
```

## 📚 API Documentation

The API documentation is available through Swagger UI when the application is running:

- **URL**: http://localhost:3000/docs
- **Authentication**: Most endpoints require JWT authentication
- **Internationalization**: Set the `Accept-Language` header to `en` or `vi` to get responses in the desired language

### Main Endpoints

- **Authentication**:
  - `POST /auth/register` - Register a new user
  - `POST /auth/login` - Login and get authentication token

- **Users**:
  - `GET /users` - List users
  - `GET /users/:id` - Get user details
  - `PATCH /users/:id` - Update user profile

- **Groups**:
  - `GET /groups` - List groups
  - `POST /groups` - Create a new group
  - `PATCH /groups/:id` - Update group details
  - `POST /groups/:id/join` - Join a group

- **Group Members**:
  - `GET /groups/:id/members` - List group members

- **Friendships**:
  - Endpoints for managing user connections

## 🧪 Testing

Currently, the project doesn't have automated tests. Contributions to add tests are welcome!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Contact

If you have any questions or suggestions, please open an issue on GitHub.