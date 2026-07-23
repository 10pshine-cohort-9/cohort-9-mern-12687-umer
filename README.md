# Block-Based Notes

A small full-stack notes application built during my internship. The project uses a block-based document model where each note is composed of one or more content blocks instead of a single text field.

The current implementation supports rich text editing with TipTap, while the ongoing task is adding Excalidraw whiteboard blocks with full CRUD support.

## Features

* User authentication
* Rich text editing with TipTap
* Create, update and delete documents
* Block-based document architecture
* Express REST API
* Prisma ORM with MySQL

## How it works

Each document owns an ordered list of blocks.

```
User
  ↓
Document
  ↓
Blocks
 ├── Rich Text
 ├── Markdown
 ├── Whiteboard
 └── Code
```

Currently every new document is initialized with a single Rich Text block.

The backend stores each block's data as JSON, making it straightforward to support additional editors without changing the overall document model.

## Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- TipTap

### Backend

- Express
- TypeScript
- Prisma
- MySQL

## API

```
GET    /documents
GET    /documents/:id

POST   /documents
PUT    /documents/:id
DELETE /documents/:id
```

All document endpoints are authenticated and scoped to the current user.

## Current Task

The current internship task is integrating **Excalidraw** as a new `WHITEBOARD` block type.

The implementation involves:

- rendering Excalidraw on the frontend
- creating new whiteboard blocks
- updating drawings
- deleting whiteboard blocks
- persisting Excalidraw scene data inside the existing `content` JSON field

The goal is to make whiteboards behave like any other document block while keeping the editor architecture extensible for future block types.

## Project Structure

```
frontend/
├── components/
├── handlers/
├── pages/

backend/
├── controllers/
├── services/
├── routes/
├── validation/

prisma/
```

## Roadmap

- [x] Authentication
- [x] Rich text editor
- [x] Document CRUD
- [x] Block-based document model