
`docker-compose.yml` (Root)

version: '3.8'

services:
  # Django Backend API
  backend:
    build:
      context: .
      dockerfile: base-app/Dockerfile.backend
    container_name: digimart-backend
    ports:
      - "3000:3000"
    volumes:
      - ./base-app/src/backend:/app
      - ./base-app/src/backend/db:/app/db  # SQLite persistence
    environment:
      - DEBUG=True
      - SECRET_KEY=${SECRET_KEY:-dev-secret-key-change-in-prod}
      - DATABASE_URL=sqlite:///db/db.sqlite3
      - ALLOWED_HOSTS=localhost,127.0.0.1,backend,frontend
      - CORS_ALLOWED_ORIGINS=http://localhost:5173,http://frontend:80
      - EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
      - DEFAULT_FROM_EMAIL=noreply@digimart.local
    command: >
      sh -c "python manage.py makemigrate api
             python manage.py migrate
             python manage.py runserver 0.0.0.0:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - digimart-net
    depends_on:
      - db-init

  # Svelte Frontend (Vite dev server)
  frontend:
    build:
      context: .
      dockerfile: base-app/Dockerfile.frontend.dev
    container_name: digimart-frontend
    ports:
      - "5173:5173"
    volumes:
      - ./base-app/src/frontend:/app
      - /app/node_modules  # Prevent host node_modules override
    environment:
      - VITE_API_BASE_URL=http://localhost:3000/api
      - VITE_APP_ENV=development
    command: npm run dev -- --host 0.0.0.0
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - digimart-net
    depends_on:
      - backend

  # Database initialization (SQLite doesn't need separate service, but this ensures migrations run)
  db-init:
    image: python:3.11-slim
    container_name: digimart-db-init
    volumes:
      - ./base-app/src/backend:/app
      - ./base-app/src/backend/db:/app/db
    working_dir: /app
    environment:
      - DATABASE_URL=sqlite:///db/db.sqlite3
    command: >
      sh -c "pip install -q -r requirements.txt &&
             python manage.py migrate --noinput &&
             echo 'Database initialized'"
    networks:
      - digimart-net

  # Playwright test runner (optional)
  playwright:
    build:
      context: .
      dockerfile: base-app/Dockerfile.playwright
    container_name: digimart-playwright
    volumes:
      - .:/app
      - ./test-results:/app/test-results
    environment:
      - PLAYWRIGHT_BROWSERS_PATH=0
      - VITE_API_BASE_URL=http://backend:3000/api
    command: npx playwright test ${TEST_PATH:-tasks/test-cases/} --reporter=list
    networks:
      - digimart-net
    depends_on:
      - backend
      - frontend
    profiles:
      - test

networks:
  digimart-net:
    driver: bridge

volumes:
  node_modules:  
    "@playwright/test": "^1.58.2",
    "@sveltejs/vite-plugin-svelte": "3.1.0",
    "svelte": "4.2.19",
    "vite": "5.4.11"