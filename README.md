# NestJS API Application

A REST API built with NestJS, PostgreSQL and Sequelize ORM.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (v12 or higher)

## Getting Started

Follow these steps to set up and run the application locally.

### 1. Install Dependencies

Clone the repository and install the npm packages:

```bash
npm install
```

### 2. Set Up PostgreSQL Database

Ensure you have PostgreSQL installed and running. You can:

- Install PostgreSQL directly on your machine, or
- Use Docker to spin up a PostgreSQL instance:

```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# App
NODE_ENV='' # [local, development, staging, prod]
PORT='3000'

# DB
DB_USERNAME=''
DB_PASSWORD=''
DB_DATABASE=''
DB_HOST=''
DB_PORT='5432'

# Auth
JWT_SECRET=''
JWT_EXPIRATION_TIME=''
HASHING_ROUNDS=''

#SW API
SW_API_BASE_URL='https://swapi.dev/api'
```

### 4. Run the Application

Start the application in development mode:

```bash
npm run start:dev
```

For production:

```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running locally, you can access the Swagger API documentation at:

http://localhost:3000/api-docs

## Project Structure

```
src/
├── auth/              # Authentication logic
├── common/            # Shared code (filters, guards, base model, etc.)
├── config/            # Application configuration
├── external-apis/     # Conection with external APIs (SW API)
├── movies/            # Movies management logic
├── scheduled-tasks/   # Scheduled tasks (sync cron jobs, etc.)
├── sync/              # Syncronization logic with external APIs' data
├── users/             # User management logic
├── app.module.ts      # Main application module
└── main.ts            # Application entry point
```

## Features

- RESTful API endpoints
- JWT Authentication
- Role-Based Access Control
- PostgreSQL with Sequelize ORM
- OpenAPI/Swagger documentation
- Input validation

