# Document Management System

A simple full-stack document management application built as part of 10 Pearls Internship. Users can create an account, log in, and manage their own documents through a secure REST API and React frontend.

## Features

- User registration and login
- JWT authentication
- Create, view, edit, and delete documents
- Rich text document editor
- Input validation using Zod
- Password hashing with bcrypt
- Prisma ORM with MySQL
- Request logging with Pino
- Backend and frontend testing

## Tech Stack

### Backend
- Node.js
- Express.js
- Prisma ORM
- MySQL
- JWT
- bcrypt
- Zod
- Pino
- Mocha & Chai

### Frontend
- React
- Axios
- TipTap Editor
- React Context API
- Vitest

## Project Structure

```
backend/
├── prisma/
├── src/
│    ├── controllers/
│    ├── middleware/
│    ├── routes/
│    ├── services/
│    ├── tests/
│    ├── utils/
│    ├── tests/
│    └── validation/
└── tests/

frontend/
├── components/
├── pages/
├── context/
├── services/
└── tests/
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/documents | Get all user documents |
| GET | /api/documents/:id | Get a single document |
| POST | /api/documents | Create a document |
| PUT | /api/documents/:id | Update a document |
| DELETE | /api/documents/:id | Delete a document |

## Database

The application uses MySQL with Prisma ORM.

Main tables:

- User
- Document
- Block
- RefreshToken

Each user can have multiple documents, and each document contains its content in a block.

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd project
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file and configure:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
```

Run Prisma migration:

```bash
npx prisma migrate dev
```

Start the server:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Testing

Backend tests:

```bash
npm test
```

Frontend tests:

```bash
npm test
```

## Screenshots

- Login Page
- Dashboard
- Document Editor

(Add screenshots here.)

## What I Learned

- Building a REST API with Express
- Using Prisma migrations and MySQL
- JWT authentication and protected routes
- Password hashing with bcrypt
- Input validation using Zod
- React Context for authentication
- Working with a rich text editor
- Writing backend and frontend tests

## Future Improvements

- Document sharing
- Real-time collaboration
- Search functionality
- Folder organization
- User profile settings
