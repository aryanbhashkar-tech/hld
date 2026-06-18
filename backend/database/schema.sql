CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE role AS ENUM (
    'INTERN',
    'HR_ADMIN',
    'SUPER_ADMIN'
);

CREATE TYPE shift_type AS ENUM (
    'DAY',
    'EVENING',
    'NIGHT'
);

CREATE TYPE attendance_status AS ENUM (
    'PRESENT',
    'LATE',
    'HALF_DAY',
    'SHORT_HOURS',
    'ABSENT',
    'MISSING_CHECKOUT'
);

CREATE TYPE attendance_risk_flag AS ENUM (
    'VERIFIED',
    'BLOCKED',
    'SPOOF_SUSPECTED',
    'MANUAL_REVIEW'
);

CREATE TYPE request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TYPE audit_action AS ENUM (
    'LOGIN',
    'LOGOUT',
    'TOKEN_REFRESH',
    'CHECK_IN',
    'CHECK_OUT',
    'BREAK_START',
    'BREAK_END',
    'SHIFT_ASSIGN',
    'SHIFT_UPDATE',
    'CORRECTION_REQUEST',
    'CORRECTION_APPROVE',
    'CORRECTION_REJECT',
    'OVERRIDE',
    'POLICY_ACCEPT'
);

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) UNIQUE NOT NULL,

    password TEXT,

    name VARCHAR(255) NOT NULL,

    employee_code VARCHAR(100) UNIQUE,

    role role DEFAULT 'INTERN',

    department VARCHAR(255),

    is_active BOOLEAN DEFAULT true,

    policy_accepted_at TIMESTAMP,

    face_registered BOOLEAN DEFAULT false,

    face_photo_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- REFRESH TOKENS
-- =====================================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    token TEXT UNIQUE NOT NULL,

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    device_id TEXT,

    ip_address TEXT,

    user_agent TEXT,

    expires_at TIMESTAMP NOT NULL,

    revoked_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SHIFTS
-- =====================================================

CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    shift_type shift_type NOT NULL,

    start_time VARCHAR(10) NOT NULL,

    end_time VARCHAR(10) NOT NULL,

    duration_hours FLOAT NOT NULL,

    grace_period_min INTEGER DEFAULT 5,

    is_night_shift BOOLEAN DEFAULT false,

    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SHIFT ASSIGNMENTS
-- =====================================================

CREATE TABLE shift_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id),

    shift_id UUID REFERENCES shifts(id),

    effective_date DATE NOT NULL,

    assigned_by_id UUID REFERENCES users(id),

    reason TEXT,

    previous_shift_id UUID REFERENCES shifts(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ATTENDANCE RECORDS
-- =====================================================

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id),

    shift_assignment_id UUID REFERENCES shift_assignments(id),

    shift_date DATE NOT NULL,

    checkin_ts BIGINT NOT NULL,

    checkout_ts BIGINT,

    checkin_lat FLOAT,

    checkin_lng FLOAT,

    checkin_accuracy FLOAT,

    checkin_ip TEXT,

    checkin_device_id TEXT,

    checkin_photo_url TEXT,

    checkout_lat FLOAT,

    checkout_lng FLOAT,

    checkout_photo_url TEXT,

    gross_hours FLOAT,

    total_break_min INTEGER DEFAULT 0,

    net_hours FLOAT,

    late_delta_min INTEGER,

    status attendance_status,

    risk_flag attendance_risk_flag DEFAULT 'VERIFIED',

    is_missing_checkout BOOLEAN DEFAULT false,

    is_locked BOOLEAN DEFAULT false,

    checkin_spoof_flag BOOLEAN DEFAULT false,

    last_ping_ts BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- BREAK RECORDS
-- =====================================================

CREATE TABLE break_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id),

    attendance_id UUID REFERENCES attendance_records(id),

    break_start_ts BIGINT NOT NULL,

    break_end_ts BIGINT,

    duration_min INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- LOCATION PINGS
-- =====================================================

CREATE TABLE location_pings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id),

    attendance_id UUID REFERENCES attendance_records(id),

    lat FLOAT NOT NULL,

    lng FLOAT NOT NULL,

    accuracy FLOAT,

    ping_ts BIGINT NOT NULL,

    ip_address TEXT,

    is_spoof_flag BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CORRECTION REQUESTS
-- =====================================================

CREATE TABLE correction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id),

    attendance_id UUID REFERENCES attendance_records(id),

    requested_checkin_ts BIGINT,

    requested_checkout_ts BIGINT,

    reason TEXT NOT NULL,

    status request_status DEFAULT 'PENDING',

    reviewed_by_id UUID REFERENCES users(id),

    reviewed_at TIMESTAMP,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id),

    action audit_action NOT NULL,

    entity_type TEXT,

    entity_id TEXT,

    old_value JSONB,

    new_value JSONB,

    ip_address TEXT,

    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);