# 🌐 Universal Data Adapter User Guide

## Introduction
The **Universal Data Adapter** allows ForecastAI to ingest and analyze structured data from various business domains beyond just sales. By automatically detecting the context of your data, the platform adapts its analysis, KPIs, and reports to provide relevant insights.

---

## 🚀 Supported Domains & Data Requirements

To ensure the best results, your CSV files should contain specific columns. The system uses "fuzzy matching," so exact names aren't required, but closer matches yield higher confidence.

### 1. Sales Forecasting
**Goal:** Forecast future demand, revenue, and identify seasonal trends.

| Data Point | Recommended Header | Accepted Synonyms |
| :--- | :--- | :--- |
| **Date** (Required) | `date` | `timestamp`, `order_date`, `sales_date` |
| **Target** (Required) | `sales` | `quantity`, `revenue`, `demand`, `units_sold` |
| **Item ID** (Required) | `item_id` | `sku`, `product_id`, `item_code` |
| **Store/Loc** | `store_id` | `store`, `location`, `warehouse` |
| **Price** | `price` | `unit_price`, `selling_price`, `cost` |

### 2. HR Analytics
**Goal:** Analyze workforce dynamics, turnover risk, and detailed headcount metrics.

| Data Point | Recommended Header | Accepted Synonyms |
| :--- | :--- | :--- |
| **Employee ID** (Required) | `employee_id` | `emp_id`, `staff_id`, `associate_id` |
| **Hire Date** (Required) | `hire_date` | `date_of_joining`, `start_date`, `doj` |
| **Status** (Required) | `status` | `active`, `employment_status` |
| **Salary** | `salary` | `wage`, `compensation`, `pay` |
| **Department** | `department` | `dept`, `team`, `division` |

### 3. Financial Metrics
**Goal:** Track financial health, cash flow, and transaction patterns.

| Data Point | Recommended Header | Accepted Synonyms |
| :--- | :--- | :--- |
| **Date** (Required) | `transaction_date` | `txn_date`, `posting_date` |
| **Amount** (Required) | `amount` | `value`, `debit`, `credit` |
| **Account** (Required) | `account_id` | `gl_code`, `ledger_id` |
| **Category** | `category` | `expense_type`, `revenue_type` |

### 4. Inventory Optimization
**Goal:** optimize stock levels and prevent stockouts.

| Data Point | Recommended Header | Accepted Synonyms |
| :--- | :--- | :--- |
| **Item ID** (Required) | `item_id` | `sku`, `product` |
| **Location** (Required) | `location_id` | `warehouse`, `store` |
| **Stock Level** (Required) | `stock_on_hand` | `soh`, `inventory`, `quantity` |
| **Reorder Point** | `reorder_point` | `rop`, `min_stock` |

---

## 🛠️ How It Works

1.  **Upload:** Drag & drop your CSV file into the "Upload Data" section.
2.  **Detection:** The system scans your columns and content to guess the domain (e.g., "78% Confidence: Sales Forecasting").
3.  **Gap Analysis:** 
    *   If core columns are missing, you will see a **Gap Report**.
    *   The system may suggest: *"Did you mean to use 'Total_Amt' as 'Sales'?"*
4.  **Profiling:** Once confirmed, the dashboard updates to show domain-specific KPIs (e.g., "Turnover Rate" for HR instead of "Total Sales").
5.  **Reporting:** An executive summary is automatically written based on the detected context.

---

## ❓ Troubleshooting

### "Domain Detection Failed / Generic Analysis"
*   **Cause:** The system couldn't find enough keywords to confidently categorize your data.
*   **Fix:** Rename your column headers to match the "Recommended Headers" above more closely.

### "Missing Critical Columns"
*   **Cause:** A required field for the core analysis is absent.
*   **Fix:** Ensure your CSV allows mapping these fields. You can use the **Column Mapper** tool in the UI to manually assign columns if the auto-detector falters.

### Analysis Errors
*   **Date Formats:** Ensure dates are in a standard format (YYYY-MM-DD or MM/DD/YYYY).
*   **Numeric Data:** Remove symbols like `$` or `,` from numeric columns (though the cleaner tries to handle this).
