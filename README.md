# CODBEE (Java Tutor Visualizer)

CODBEE is an interactive code visualization application for Java (inspired by Python Tutor).

## Project Structure

```
.
├── backend/    # Spring Boot 3.x (Java 17) REST API backend
└── frontend/   # React + Vite frontend application
```

## Prerequisites

- **Java 17** or higher
- **Apache Maven 3.8+**
- **Node.js 18+** and `npm`

---

## How to Run

### 1. Running the Backend

Navigate to the `backend` directory and execute:

```bash
cd backend
mvn spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080`**.

- **Health Check Endpoint**:  
  `GET http://localhost:8080/api/health` → `{"status":"ok"}`

---

### 2. Running the Frontend

Navigate to the `frontend` directory, install dependencies (if not done already), and start the development server:

```bash
cd frontend
npm install
npm run dev
```

The React + Vite development server will start on **`http://localhost:5173`**.

---

## API & Endpoints

- `GET /api/health`: Health status endpoint returning JSON `{"status": "ok"}`.
