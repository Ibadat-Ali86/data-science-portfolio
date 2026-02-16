# AdaptIQ System Architecture

## Overview
AdaptIQ is a robust SaaS demand forecasting platform designed for enterprise scale. It leverages a modern React frontend and a high-performance Python backend to deliver accurate ML-driven forecasts.

## High-Level Architecture

```mermaid
graph TD
    User[👤Client] -->|HTTPS| FE[⚛️Frontend (React + Vite)]
    FE -->|REST API| BE[🐍Backend (FastAPI)]
    
    subgraph "Frontend Layer"
        FE --> Auth[🔐 Authentication]
        FE --> Dash[📊 Dashboard]
        FE --> Pipe[🚄 Analysis Pipeline]
        FE --> Vis[📈 Visualization]
    end
    
    subgraph "Backend Layer"
        BE --> API[App Router]
        API --> Svc[Services]
        Svc --> MLSvc[🧠 ML Service]
        Svc --> BISvc[💡 BI Service]
        MLSvc --> Models[Models (XGBoost/Prophet)]
    end
    
    subgraph "Data Layer"
        BE --> DB[(🗃️ SQLite/Postgres)]
        MLSvc --> Artifacts[📦 Model Registry]
    end
```

## Component Breakdown

### 1. Frontend (React 19 + Vite)
- **State Management**: React Context (`AuthContext`, `FlowContext`, `ThemeContext`).
- **Routing**: React Router v6 with protected routes.
- **Styling**: TailwindCSS v3.4 with custom design tokens.
- **Micro-Interactions**: Framer Motion for page transitions and component animations.
- **Visualization**: Chart.js for interactive forecasting charts.

### 2. Backend (FastAPI)
- **API Design**: RESTful architecture with Pydantic schemas.
- **Authentication**: JWT-based stateless auth with OAuth2 support (Google/GitHub).
- **ML Pipeline**: Modular design with separate services for:
    - **Profiling**: Pandas profiling and data quality checks.
    - **Preprocessing**: Sklearn pipelines for imputation and encoding.
    - **Training**: Dynamic ensemble of XGBoost, Prophet, and SARIMA.
    - **Forecasting**: Multi-step horizon prediction.

### 3. Machine Learning Engine
- **Model Router**: Automatically selects the best model per time series.
- **Hyperparameter Optimization**: Grid/Random search for tuning.
- **Store Clustering**: K-means clustering to group similar stores.
- **Validation**: Time-series cross-validation to prevent leakage.

## Data Flow
1. **Ingestion**: User uploads CSV -> Backend parses & validates -> Stores in temp storage.
2. **Profiling**: Backend analyzes data -> Returns metadata & quality score -> Frontend displays report.
3. **Training**: User configures parameters -> Backend trains models async -> Updates progress via polling.
4. **Forecasting**: Backend generates future predictions -> Returns JSON -> Frontend visualizes.

## Deployment Strategy
- **Docker**: Multi-stage build for frontend and backend.
- **CI/CD**: GitHub Actions for automated testing and linting.
- **Hosting**: Compatible with Hugging Face Spaces, AWS ECS, or Render.
