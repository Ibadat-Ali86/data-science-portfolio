# AdaptIQ User Guide

## Introduction
Welcome to AdaptIQ, your intelligent demand planning platform. This guide will walk you through the core workflows to get the most out of your data.

## 1. Getting Started
### Login / Register
Access the platform at `http://localhost:5173`.
- **Login**: Use your credentials or sign in with Google/GitHub.
- **Register**: Create a new account if you don't have one.

## 2. Dashboard Overview
Upon logging in, you'll see the **Executive Dashboard**.
- **KPI Cards**: Real-time metrics on forecast accuracy, stockouts, and revenue.
- **Activity Feed**: Recent actions taken by your team.
- **System Health**: Status of the ML engine and API.

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
Generate professional reports for stakeholders.
- Navigate to the **Reports** page.
- Select **Executive Summary** (PDF) or **Detailed Data** (Excel).
- Click **Download** to get your report.

## FAQ
**Q: What data format is supported?**
A: CSV files with columns for Date, Target (Sales), and optional features (Store, Item, etc.).

**Q: Can I export the forecasts?**
A: Yes, use the **Export CSV** button in the Forecast Explorer or Reports page.
