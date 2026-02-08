-- Supabase Migration: Row-Level Security (RLS) Policies
-- Run this AFTER 001_initial_schema.sql
-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE historical_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- =====================================================
-- HISTORICAL SALES POLICIES
-- =====================================================
-- Users can view their own sales data
CREATE POLICY "Users can view own sales data" ON historical_sales FOR
SELECT USING (auth.uid() = user_id);
-- Users can insert their own sales data
CREATE POLICY "Users can insert own sales data" ON historical_sales FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own sales data
CREATE POLICY "Users can update own sales data" ON historical_sales FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Users can delete their own sales data
CREATE POLICY "Users can delete own sales data" ON historical_sales FOR DELETE USING (auth.uid() = user_id);
-- =====================================================
-- FORECASTS POLICIES
-- =====================================================
-- Users can view their own forecasts
CREATE POLICY "Users can view own forecasts" ON forecasts FOR
SELECT USING (auth.uid() = user_id);
-- Users can create forecasts for themselves
CREATE POLICY "Users can create own forecasts" ON forecasts FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can delete their own forecasts
CREATE POLICY "Users can delete own forecasts" ON forecasts FOR DELETE USING (auth.uid() = user_id);
-- =====================================================
-- SCENARIOS POLICIES
-- =====================================================
-- Users have full CRUD on their own scenarios
CREATE POLICY "Users can manage own scenarios" ON scenarios FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- =====================================================
-- REPORTS POLICIES
-- =====================================================
-- Users have full CRUD on their own reports
CREATE POLICY "Users can manage own reports" ON reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- =====================================================
-- PROFILES POLICIES
-- =====================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- =====================================================
-- STORES TABLE (PUBLIC READ)
-- =====================================================
-- Stores are public read (no user-specific data)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stores" ON stores FOR
SELECT TO authenticated USING (true);
-- Only admins can modify stores (via service role)
-- No direct user modification allowed
-- =====================================================
-- GRANT USAGE TO ANON AND AUTHENTICATED
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon,
    authenticated;
GRANT SELECT ON stores TO anon,
    authenticated;
GRANT ALL ON historical_sales TO authenticated;
GRANT ALL ON forecasts TO authenticated;
GRANT ALL ON scenarios TO authenticated;
GRANT ALL ON reports TO authenticated;
GRANT ALL ON profiles TO authenticated;
-- Grant sequence usage for auto-increment
GRANT USAGE,
    SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;