-- Supabase Migration: Initial Schema for Walmart Forecasting Platform
-- Run this in your Supabase SQL Editor
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =====================================================
-- STORES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    store_type VARCHAR(1) CHECK (store_type IN ('A', 'B', 'C')),
    size INTEGER,
    cluster_id INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- =====================================================
-- HISTORICAL SALES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS historical_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id INTEGER REFERENCES stores(id),
    dept INTEGER NOT NULL,
    date DATE NOT NULL,
    weekly_sales NUMERIC(12, 2),
    temperature NUMERIC(5, 2),
    fuel_price NUMERIC(4, 2),
    markdown1 NUMERIC(10, 2),
    markdown2 NUMERIC(10, 2),
    markdown3 NUMERIC(10, 2),
    markdown4 NUMERIC(10, 2),
    markdown5 NUMERIC(10, 2),
    cpi NUMERIC(10, 3),
    unemployment NUMERIC(5, 2),
    is_holiday BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, dept, date, user_id)
);
-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_sales_store_dept ON historical_sales(store_id, dept, date);
CREATE INDEX IF NOT EXISTS idx_sales_user ON historical_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON historical_sales(date DESC);
-- =====================================================
-- FORECASTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id INTEGER,
    dept INTEGER,
    date DATE NOT NULL,
    predicted_sales NUMERIC(12, 2) NOT NULL,
    confidence_lower NUMERIC(12, 2),
    confidence_upper NUMERIC(12, 2),
    model_version VARCHAR(50) DEFAULT 'v1.0',
    model_used VARCHAR(50) DEFAULT 'xgboost',
    mape NUMERIC(5, 3),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forecasts_store_dept ON forecasts(store_id, dept, date DESC);
CREATE INDEX IF NOT EXISTS idx_forecasts_user ON forecasts(user_id);
-- =====================================================
-- SCENARIOS TABLE (for What-If Analysis)
-- =====================================================
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scenarios_user ON scenarios(user_id);
-- =====================================================
-- REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    -- 'forecast', 'analysis', 'performance', 'executive'
    format VARCHAR(10) NOT NULL,
    -- 'pdf', 'xlsx', 'csv'
    file_path TEXT,
    parameters JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
-- =====================================================
-- USER PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    -- 'user', 'admin', 'analyst'
    preferences JSONB DEFAULT '{"theme": "dark", "notifications": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- =====================================================
-- TRIGGER: Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (id, full_name, avatar_url)
VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- =====================================================
-- SEED DATA: Sample stores (45 stores like Walmart dataset)
-- =====================================================
INSERT INTO stores (id, store_type, size, cluster_id)
VALUES (1, 'A', 151315, 0),
    (2, 'A', 202307, 0),
    (3, 'B', 37392, 1),
    (4, 'A', 205863, 0),
    (5, 'B', 34875, 1),
    (6, 'A', 202505, 0),
    (7, 'B', 70713, 1),
    (8, 'A', 155078, 0),
    (9, 'B', 125833, 1),
    (10, 'B', 126512, 1),
    (11, 'A', 207499, 0),
    (12, 'B', 112238, 1),
    (13, 'A', 219622, 0),
    (14, 'A', 200898, 0),
    (15, 'B', 123737, 1),
    (16, 'B', 57197, 1),
    (17, 'B', 93188, 1),
    (18, 'B', 120653, 1),
    (19, 'A', 203819, 0),
    (20, 'A', 203742, 0) ON CONFLICT (id) DO NOTHING;
COMMENT ON TABLE stores IS 'Walmart store information with type (A/B/C) and cluster assignment';
COMMENT ON TABLE historical_sales IS 'Historical weekly sales data per store and department';
COMMENT ON TABLE forecasts IS 'ML-generated sales forecasts with confidence intervals';
COMMENT ON TABLE scenarios IS 'User-created what-if scenarios for business planning';
COMMENT ON TABLE reports IS 'Generated reports metadata and file references';
COMMENT ON TABLE profiles IS 'Extended user profiles with preferences';