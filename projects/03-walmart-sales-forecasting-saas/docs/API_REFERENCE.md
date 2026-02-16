# AdaptIQ API Reference

## Authentication
All API endpoints (except `/login` and `/register`) require a Bearer Token.
Header: `Authorization: Bearer <token>`

## Endpoints

### Auth
- `POST /api/auth/login`: Authenticate user and get token.
- `POST /api/auth/register`: Create a new user account.

### Analysis Pipeline
- `POST /api/analysis/upload`: Upload a CSV dataset.
- `POST /api/analysis/profile`: Generate data profile and quality report.
- `POST /api/analysis/preprocess`: Clean and transform data.
- `POST /api/analysis/train`: Train forecasting models.

### Forecasting
- `POST /api/forecasts/generate`: Generate predictions for a specific horizon.
- `GET /api/forecasts/predictions`: Retrieve stored predictions.

### Reports
- `POST /api/reports/generate`: Generate a PDF or Excel report.
- `GET /api/reports/download/{filename}`: Download a generated report.

### System
- `GET /api/health`: Check API status.
- `GET /api/metrics`: Retrieve system metrics (CPU/Memory usage).
