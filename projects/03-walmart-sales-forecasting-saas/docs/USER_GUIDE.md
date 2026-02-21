# AdaptIQ User Guide

## Introduction
Welcome to AdaptIQ, your intelligent demand planning platform. This guide will walk you through the core workflows to get the most out of your data.

## 1. Getting Started
### Login / Register
Access the platform at `http://localhost:5173`.
- **Login**: Use your credentials or sign in with Google/GitHub.
- **Register**: Create a new account if you don't have one.

## 2. Dashboards Overview
Upon logging in, you'll have access to multiple real-time dashboards driven by our AI backend.

### Main Dashboard (`/dashboard`)
Serves as your home screen, featuring an overview of system health and active model performance.
- **KPI Cards**: Shows your current model's MAPE, projected savings/revenue, active optimization targets, and immediate stockout risk levels.
- **Activity Feed**: Tracks recent analyses run by you and your team.
- **System Health**: Backend and Frontend connectivity status.

### Executive Dashboard (`/executive`)
High-level strategic overview meant for decision makers.
- **Projected Value**: Revenue Impact and Model Accuracy metrics.
- **Real-Time Insights**: Dynamic summary alerts directly derived from the AI's risk assessment and trend analysis algorithms.
- **Monitoring Alerts**: Automatic drift detection and health warnings if target bounds are exceeded.

## 3. Running an Analysis
Navigate to the **Analysis** tab to start a new forecast.

### Step 1: Upload Data
- Drag and drop your CSV file (sales data) or use the **Load Demo Data** button.
- The system will automatically detect columns. Verify the mapping in the **Column Mapping** modal.

### Step 2: Profiling
- Review the **Data Quality Report**.
- Check for missing values, outliers, and data distribution.
- The system suggests "Smart Proxies" if data is missing (e.g., Holidays).

### Step 3: Preprocessing
- Click **Start Preprocessing**.
- Watch the real-time logs as the system cleans and prepares your data.

### Step 4: Model Training
- Choose a model (e.g., **Auto-Ensemble**, **Prophet**, **XGBoost**).
- Click **Train Model**. The system will optimize hyperparameters automatically.

### Step 5: Results
- View the **Forecast Accuracy** metrics (MAPE, R²).
- Explore the interactive chart to compare Actuals vs. Predicted values.

## 4. Scenario Planning
Use the **Scenario Planning** tool to simulate "What-If" scenarios.
- Adjust **Price**, **Marketing Spend**, or **Economic Factors**.
- See the immediate impact on predicted sales and revenue.

## 5. Reports
Generate professional, board-ready reports for stakeholders directly mapped from your unique ML pipeline results.
- Navigate to the **Reports** page.
- Select your **Report Type**: 
  - *Comprehensive*: Full analysis including insights, model metrics, and action plans.
  - *Forecast*: Pure numerical predictions.
  - *Metrics*: Data science focus on MAPE, RMSE, and hyperparameters.
  - *Insights*: Strategic business recommendations and risk analysis.
- Choose your **Export Format** (PDF, Excel, CSV).
- Click **Generate & Download**. The PDF export will automatically synthesize your Executive Summary, Problem Formulation, Revenue Impact, and Strategic Action Plan from the Python AI microservice.

## FAQ
**Q: What data format is supported?**
A: CSV files with columns for Date, Target (Sales), and optional features (Store, Item, etc.).

**Q: Can I export the forecasts?**
A: Yes, use the **Export CSV** button in the Forecast Explorer or Reports page.
