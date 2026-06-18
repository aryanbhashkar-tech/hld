# DIFM Attendance App

A comprehensive attendance management system built with Node.js, Express, and PostgreSQL. This backend application handles user authentication, shift management, attendance tracking, and location-based check-ins/check-outs.

## Architecture Overview

### Technology Stack
- **Backend Framework**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) with refresh token mechanism
- **Password Hashing**: bcryptjs
- **Logging**: Winston
- **Database Client**: pg (node-postgres) Pool

### Database Schema

The application uses a relational database with the following key entities:

#### Core Tables
- **users**: Stores user information including roles (INTERN, HR_ADMIN, SUPER_ADMIN)
- **shifts**: Defines shift types (DAY, EVENING, NIGHT) with start/end times
- **shift_assignments**: Links users to their assigned shifts with effective dates
- **attendance_records**: Main attendance tracking table with check-in/out timestamps, location data, and status
- **break_records**: Tracks break periods during work shifts
- **location_pings**: Stores GPS location data for verification
- **correction_requests**: Handles attendance correction requests and approvals
- **audit_logs**: Comprehensive audit trail for all system actions
- **refresh_tokens**: Manages JWT refresh tokens for secure authentication

#### Key Features
- **Role-based Access Control**: Three user roles with different permissions
- **Location Tracking**: GPS-based check-in verification with spoof detection
- **Shift Management**: Flexible shift assignments with historical tracking
- **Attendance Analytics**: Detailed tracking of working hours, breaks, and late arrivals
- **Audit Compliance**: Complete audit trail for all user actions
- **Correction Workflow**: Request and approval system for attendance corrections

### Application Structure

```
backend/
├── config/
│   └── db.js                 # Database connection configuration
├── database/
│   └── schema.sql            # PostgreSQL schema definition
├── generated/
│   └── prisma/               # Prisma client (currently unused)
├── lib/                      # Shared libraries
├── logs/                     # Application logs
├── modules/
│   ├── attendance/           # Attendance management module
│   │   ├── attendance.controller.js
│   │   ├── attendance.route.js
│   │   ├── attendance.service.js
│   │   └── attendance.utils.js
│   ├── auth/                 # Authentication module
│   │   ├── auth.controller.js
│   │   ├── auth.middleware.js
│   │   ├── auth.routes.js
│   │   ├── auth.service.js
│   │   └── auth.util.js
│   └── shifts/               # Shift management module
│       ├── shifts.controller.js
│       ├── shifts.router.js
│       └── shifts.service.js
├── prisma/
│   └── seed.js               # Database seeding script
├── scripts/
│   └── createTestUsers.js    # Test user creation script
├── utils/
│   ├── jwt.js                # JWT token utilities
│   └── logger.js             # Logging configuration
├── index.js                  # Application entry point
└── package.json
```

### API Endpoints

All API endpoints return JSON responses with the following structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object (optional)
}
```

#### Authentication (`/auth`)
All endpoints require proper request headers and return appropriate HTTP status codes.

- `POST /auth/login`
  - **Description**: Authenticate user and return access token
  - **Body**:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - **Response**: Sets `refreshToken` cookie and returns access token
  - **Success Response**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "accessToken": "jwt_token",
        "user": {
          "id": "uuid",
          "email": "string",
          "role": "enum",
          "policyAcceptedAt": "timestamp"
        }
      }
    }
    ```

- `POST /auth/refresh`
  - **Description**: Refresh access token using refresh token from cookie
  - **Requires**: `refreshToken` cookie
  - **Response**: New access token

- `POST /auth/logout`
  - **Description**: Logout user and revoke refresh token
  - **Requires**: Authentication header + refresh token cookie
  - **Response**: Clears refresh token cookie

- `GET /auth/profile`
  - **Description**: Get current user profile
  - **Requires**: Authentication header
  - **Response**: User profile information

#### Shifts (`/shifts`)

- `POST /shifts/assign`
  - **Description**: Assign shift to user (HR Admin/Super Admin only)
  - **Requires**: Authentication + HR_ADMIN/SUPER_ADMIN role
  - **Body**:
    ```json
    {
      "userId": "uuid",
      "shiftId": "uuid",
      "effectiveDate": "YYYY-MM-DD",
      "reason": "string (optional)"
    }
    ```
  - **Response**: Shift assignment details

- `GET /shifts/my-shift`
  - **Description**: Get current user's assigned shift
  - **Requires**: Authentication
  - **Response**: Current shift information

#### Attendance (`/attendance`)

- `POST /attendance/check-in`
  - **Description**: Check-in for current shift
  - **Requires**: Authentication
  - **Body**: Optional location data (lat, lng, accuracy, etc.)
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Check-in successful",
      "data": {
        "id": "uuid",
        "user_id": "uuid",
        "shift_id": "uuid",
        "shift_date": "date",
        "check_in": "timestamp"
      }
    }
    ```

- `POST /attendance/check-out`
  - **Description**: Check-out from current shift
  - **Requires**: Authentication + Active check-in session
  - **Response**: Updated attendance record with calculated hours

### Authentication

#### JWT Token Usage
- **Access Token**: Include in Authorization header as `Bearer <token>`
- **Refresh Token**: Automatically managed via HTTP-only cookies
- **Token Expiry**: Access tokens expire in 15 minutes, refresh tokens in 7 days

#### Role-Based Access Control
- **INTERN**: Basic attendance operations
- **HR_ADMIN**: Shift management + intern permissions
- **SUPER_ADMIN**: Full system access

#### Middleware Flow
1. `authenticate`: Validates JWT token and attaches user to request
2. `authorizeRoles`: Checks if user has required role(s)
3. `policyAccepted`: Ensures user has accepted terms (future use)

### Error Handling

All endpoints follow consistent error response format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `500`: Internal Server Error

### How It Works

1. **Authentication Flow**:
   - Users login with email/password
   - JWT access token issued for API access
   - Refresh tokens stored in database for token renewal
   - Role-based middleware controls access to endpoints

2. **Attendance Tracking**:
   - Users check-in at shift start with GPS location
   - System validates location and shift timing
   - Breaks are tracked separately from work time
   - Check-out calculates total hours worked
   - Risk flags detect potential spoofing or anomalies

3. **Shift Management**:
   - Admins assign shifts to users with effective dates
   - Historical shift assignments maintained
   - Shift windows calculated with grace periods

4. **Location Verification**:
   - GPS coordinates captured on check-in/check-out
   - Accuracy and spoof detection algorithms
   - Location pings stored for audit trail

## Setup and Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DIFM-Attendance-App/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=difm_attendance
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password

   # JWT Configuration
   JWT_ACCESS_SECRET=your_super_secret_access_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb difm_attendance

   # Run schema
   psql -d difm_attendance -f database/schema.sql
   ```

5. **Seed Database**
   ```bash
   npm run seed
   ```

6. **Start Server**
   ```bash
   npm run dev  # Development with nodemon
   # or
   npm start    # Production
   ```

## Development Guidelines

### Code Style and Conventions

#### Naming Conventions
- **Files**: kebab-case for route files (`auth.routes.js`), camelCase for others (`authController.js`)
- **Functions**: camelCase (`checkInService`)
- **Constants**: UPPER_SNAKE_CASE (`JWT_ACCESS_SECRET`)
- **Database**: snake_case for columns and tables (`user_id`, `check_in`)

#### Error Handling
- Services throw errors with descriptive messages
- Controllers catch errors and return appropriate HTTP status codes
- Use `error.statusCode` for custom status codes when needed

#### Database Queries
- Use parameterized queries (`$1`, `$2`) to prevent SQL injection
- Wrap multi-step operations in transactions with BEGIN/COMMIT/ROLLBACK
- Always release client connections in finally blocks

### Development Workflow

1. **API Testing**:
   - Use Postman, Insomnia, or curl for testing endpoints
   - Include `Authorization: Bearer <access_token>` header for protected routes
   - Refresh tokens are handled automatically via HTTP-only cookies

2. **Database Changes**:
   - Modify `database/schema.sql` for schema changes
   - Run manual SQL scripts to update development database
   - Update seeding scripts as needed

3. **Adding New Features**:
   - Follow the module pattern (controller → service → database)
   - Add authentication middleware to protected routes
   - Include proper error handling and logging
   - Update this README with new endpoints

## Code Architecture Deep Dive

### Module Organization

Each business domain follows a consistent layered architecture:

```
modules/[domain]/
├── [domain].controller.js    # HTTP request/response handling
├── [domain].service.js       # Business logic and data operations
├── [domain].router.js        # Route definitions and middleware
└── [domain].utils.js         # Helper functions (when needed)
```

#### Controllers Layer
- **Purpose**: Handle HTTP requests and format responses
- **Responsibilities**:
  - Extract data from `req.body`, `req.params`, `req.user`
  - Validate input data (currently minimal)
  - Call service functions with prepared data
  - Format JSON responses with consistent structure
  - Handle errors and return appropriate status codes

#### Services Layer
- **Purpose**: Implement business logic and database operations
- **Responsibilities**:
  - Execute complex business rules
  - Perform database queries using the connection pool
  - Handle transactions for multi-step operations
  - Transform data between database and API formats
  - Throw descriptive errors for controllers to catch

#### Routes Layer
- **Purpose**: Define API endpoints and apply middleware
- **Responsibilities**:
  - Map HTTP methods and paths to controller functions
  - Apply authentication and authorization middleware
  - Group related endpoints under common base paths
  - Handle route-level validation (currently minimal)

### Request Flow Example

```
POST /attendance/check-in
       ↓
middleware: authenticate (validates JWT)
       ↓
shifts.router.js: route matches, calls checkInController
       ↓
attendance.controller.js: extracts userId from req.user
       ↓
attendance.service.js: checkInService(userId)
       ↓
Database: INSERT into attendance table
       ↓
Response: formatted JSON with success/data
```

### Database Layer

#### Connection Management
- Uses `pg.Pool` for efficient connection pooling
- Single pool instance created in `config/db.js`
- Automatic connection acquisition and release
- Environment-based configuration

#### Query Patterns
- **Parameterized Queries**: Prevent SQL injection
- **Transactions**: ACID compliance for multi-step operations
- **Error Handling**: Rollback on failures, connection cleanup

#### Current Limitations
- **No ORM**: Direct SQL makes refactoring difficult
- **No Migrations**: Schema changes require manual intervention
- **No Query Building**: Complex queries are string-concatenated
- **No Connection Retry**: Failures require app restart

### Authentication System

#### JWT Implementation
- **Access Tokens**: Short-lived (15min), used for API access
- **Refresh Tokens**: Long-lived (7 days), stored in HTTP-only cookies
- **Token Storage**: Refresh tokens stored in database for revocation

#### Middleware Chain
1. `authenticate`: Validates JWT and attaches user to request
2. `authorizeRoles`: Checks role permissions
3. `policyAccepted`: Future use for terms acceptance

#### Security Features
- HTTP-only cookies for refresh tokens
- Secure cookie flags in production
- Token revocation on logout
- IP and User-Agent tracking for refresh tokens

### Error Handling Strategy

#### Current Implementation
- Services throw `Error` objects with messages
- Controllers catch and return 400/500 status codes
- Inconsistent error formatting across endpoints

#### Recommended Improvements
- Custom error classes with status codes
- Centralized error handling middleware
- Structured error logging
- User-friendly error messages

## Default Test Users

After seeding, the following users are available:

- **Super Admin**: admin@difm.com / Admin@1234
- **HR Admin**: hr@difm.com / HR@1234
- **Intern**: intern@difm.com / Intern@123

## Current Implementation Status

## Current Implementation Status

### Completed Features
- ✅ User authentication with JWT tokens and refresh mechanism
- ✅ Role-based access control (INTERN, HR_ADMIN, SUPER_ADMIN)
- ✅ Basic attendance check-in/check-out functionality
- ✅ Shift assignment and retrieval for users
- ✅ Database schema with comprehensive tables for future features
- ✅ Winston logging system
- ✅ Cookie-based refresh token management
- ✅ Basic error handling and response formatting

### Partially Implemented
- 🟡 Audit logging (schema exists, basic logging in place)
- 🟡 User profile endpoint (basic implementation)

### Not Yet Implemented
- ❌ Break tracking (schema exists, no API endpoints)
- ❌ Location/GPS verification (schema supports it, not implemented in services)
- ❌ Attendance corrections (schema exists, no API)
- ❌ Attendance history retrieval
- ❌ Shift management beyond assignment
- ❌ Photo upload for check-in verification
- ❌ Risk flag calculations
- ❌ Correction request workflow
- ❌ Location ping tracking

### Known Issues
- **Critical**: Table name mismatch - Code uses `attendance` table, but schema defines `attendance_records`
- **Security**: No input validation on API endpoints
- **Security**: Missing rate limiting
- **Architecture**: Raw SQL queries instead of ORM (Prisma installed but unused)
- **Error Handling**: Inconsistent error responses across endpoints
- **Testing**: No automated tests
- **Documentation**: No API documentation beyond this README

## Architecture Improvements

### High Priority
1. **Database Layer Refactoring**
   - Replace raw SQL queries with Prisma ORM for type safety
   - Fix table name inconsistencies
   - Add database migrations

2. **API Security & Validation**
   - Add input validation (Joi/express-validator)
   - Implement rate limiting
   - Add CORS configuration
   - Sanitize user inputs

3. **Error Handling**
   - Global error handling middleware
   - Consistent error response format
   - Proper HTTP status codes

### Medium Priority
4. **Testing**
   - Unit tests for services
   - Integration tests for API endpoints
   - Database test setup

5. **Documentation**
   - API documentation (Swagger/OpenAPI)
   - Code documentation
   - Postman collection

6. **Monitoring & Logging**
   - Structured logging with request IDs
   - Performance monitoring
   - Health check endpoints

### Low Priority
7. **Containerization**
   - Docker setup for development
   - Docker Compose for full stack
   - Production deployment scripts

8. **Frontend Integration**
   - REST API optimization for mobile/web clients
   - File upload handling for photos
   - Real-time notifications (WebSocket)

9. **Advanced Features**
   - Facial recognition integration
   - Advanced analytics dashboard
   - Automated shift scheduling
   - Integration with HR systems

### Code Quality Improvements
- **Type Safety**: Migrate to TypeScript for better development experience
- **Code Organization**: Implement repository pattern for data access
- **Configuration Management**: Environment-specific configurations
- **Security**: Implement OWASP security best practices
- **Performance**: Database query optimization and caching

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure all linting passes
5. Create migration scripts for schema changes

## License

ISC