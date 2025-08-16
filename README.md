# Full Stack Application

This repository contains a **server** (backend) and **webApp** (frontend).  
The backend is built with **Node.js, TypeScript, Express, MongoDB**, while the frontend uses **React, Vite, and TypeScript**.

---

## Project Structure

```text
.
├─ server/     # Backend API (Express + TypeScript)
├─ webApp/     # Frontend (React + Vite)
└─ README.md
```

---

## Prerequisites

- **Node.js** ≥ 18 (LTS recommended)  
- **npm** ≥ 9  
- **MongoDB** connection string (local or Atlas)  

---

## Setup

### 1. Install dependencies

Go to the **server** folder and install dependencies:
```bash
cd server
npm install
```

Then go to the **webApp** folder and install dependencies:
```bash
cd ../webApp
npm install
```

---

### 2. Environment Variables

#### `server/.env_dev`
```bash
PORT=3000
MONGO_URI=mongodb+srv://user:pass@cluster/dbname
JWT_SECRET=replace_me
GOOGLE_CLIENT_ID=replace_me.apps.googleusercontent.com
UPLOADS_DIR=uploads
```

#### `server/.env_test`
```bash
PORT=3000
MONGO_URI=mongodb+srv://user:pass@cluster/dbname_test
JWT_SECRET=test_secret
GOOGLE_CLIENT_ID=test.apps.googleusercontent.com
```

#### `server/.env_prod`
```bash
PORT=3000
MONGO_URI=mongodb+srv://user:pass@cluster/dbname_prod
JWT_SECRET=prod_secret
GOOGLE_CLIENT_ID=prod.apps.googleusercontent.com
```

#### `webApp/.env`
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=replace_me.apps.googleusercontent.com
```

---

## Development

Run the backend and frontend in separate terminals.

### Backend (server)

- **Windows**
  ```bash
  cd server
  npm run dev
  ```

- **macOS/Linux**
  ```bash
  cd server
  cp .env_dev .env && npx nodemon ./src/app.ts
  ```

### Frontend (webApp)
```bash
cd webApp
npm run dev
```

- Vite dev server: [http://localhost:5173](http://localhost:5173)  
- API server: [http://localhost:3000](http://localhost:3000)

---

## Production

### Backend

- **Windows**
  ```bash
  cd server
  npm run prod
  ```

- **macOS/Linux**
  ```bash
  cd server
  cp .env_prod .env && tsc -p tsconfig_prod.json && node ./dist/src/app.js
  ```

### Frontend
```bash
cd webApp
npm run build
```

(Optional preview server)
```bash
npm run preview
```

---

## Testing (server)

From inside `server/`:

```bash
npm test               # all tests
npm run testAuth       # user_auth.test.ts
npm run chargingStation # add_charger.test.ts
npm run commentsOnCharger # add_comments.test.ts
npm run bookCharger    # book_a_charger.test.ts
npm run carDataTest    # car_data.test.ts
```

---

## Linting

- **server**
  ```bash
  cd server
  npm run lint
  ```

- **webApp**
  ```bash
  cd webApp
  npm run lint
  ```

---

## Tech Stack

**Backend (server)**
- TypeScript, Express, Mongoose
- JWT, Google OAuth (`google-auth-library`)
- File uploads (`multer`)
- API Docs (`swagger-jsdoc`, `swagger-ui-express`)
- Tests: Jest + Supertest
- Tooling: ESLint

**Frontend (webApp)**
- React 19 (RC), Vite, TypeScript
- UI: MUI + Emotion
- Routing: React Router v7
- Maps: Leaflet + React-Leaflet
- Tooling: ESLint

---

## Swagger

If enabled, API docs are available at:

```
http://localhost:3000/api-docs
```
