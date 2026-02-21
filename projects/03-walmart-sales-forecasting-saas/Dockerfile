# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Set VITE_API_URL to / so requests go to same origin (backend serves them)
ARG VITE_API_URL="/"
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Setup Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app ./app
# Copy models if they exist, otherwise ensure directory exists
COPY backend/models ./models

# Copy frontend build to static directory
# Ensure the destination directory exists (though COPY creates it)
COPY --from=frontend-build /app/frontend/dist ./app/static

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=7860

# Expose port (Hugging Face Spaces default)
EXPOSE 7860

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
