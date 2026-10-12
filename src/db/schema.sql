-- =====================================================================
-- DATABASE MIGRATION SCRIPT: PORTAL ASESMEN DIGITAL MIN 1 PASER
-- Engine: PostgreSQL 15+ / Supabase
-- Timezone default: Asia/Makassar (WITA)
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TYPE user_role_enum AS ENUM ('super_admin', 'guru', 'wali_kelas', 'siswa');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- References auth.users(id) in Supabase
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role_enum NOT NULL DEFAULT 'guru',
    nip_or_nis VARCHAR(50),
    avatar_url TEXT,
    assigned_class_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 2. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year_label VARCHAR(20) NOT NULL, -- e.g. '2026/2027'
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('Ganjil', 'Genap')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 3. CLASSES (ROMBEL)
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level INT NOT NULL CHECK (level BETWEEN 1 AND 6),
    rombel VARCHAR(10) NOT NULL, -- e.g. '6A'
    name VARCHAR(50) NOT NULL, -- e.g. 'Kelas 6A'
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE RESTRICT,
    homeroom_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    student_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 4. TEACHERS MASTER
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    nip VARCHAR(30),
    title VARCHAR(50),
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 5. STUDENTS MASTER
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    nis VARCHAR(30) NOT NULL UNIQUE,
    nisn VARCHAR(30),
    full_name VARCHAR(255) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('L', 'P')),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(30),
    current_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 6. CLASS ENROLLMENTS
CREATE TABLE IF NOT EXISTS class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar'),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'promoted', 'transferred', 'graduated')),
    UNIQUE (student_id, academic_year_id)
);

-- 7. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    subject_group VARCHAR(100) NOT NULL,
    kktp_standard NUMERIC(5,2) DEFAULT 75.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 8. ASSESSMENT CATEGORIES (6 Kategori Wajib)
CREATE TABLE IF NOT EXISTS assessment_categories (
    id VARCHAR(50) PRIMARY KEY, -- 'formatif', 'sumatif_akhir_bab', 'sas', 'sat', 'try_out', 'tka'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    accent_color VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 9. ASSESSMENTS MAIN
CREATE TYPE assessment_status_enum AS ENUM ('draft', 'terjadwal', 'berlangsung', 'selesai', 'dibatalkan');

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) NOT NULL REFERENCES assessment_categories(id),
    level INT NOT NULL CHECK (level BETWEEN 1 AND 6),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    semester VARCHAR(10) NOT NULL CHECK (semester IN ('Ganjil', 'Genap')),
    chapter_or_topic VARCHAR(255) NOT NULL,
    cp_or_tp TEXT,
    description TEXT,
    instructions TEXT,
    special_notes TEXT,
    max_score NUMERIC(5,2) DEFAULT 100.00,
    passing_score NUMERIC(5,2) DEFAULT 75.00,
    is_score_published BOOLEAN DEFAULT FALSE,
    is_official_tka BOOLEAN DEFAULT FALSE,
    tryout_organizer VARCHAR(150),
    exam_session VARCHAR(50),
    exam_room VARCHAR(50),
    follow_up_plan TEXT,
    status assessment_status_enum DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 10. ASSESSMENT LINKS & PLATFORM METADATA
CREATE TABLE IF NOT EXISTS assessment_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,
    platform_name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    can_student_open BOOLEAN DEFAULT TRUE,
    verification_tested_at TIMESTAMPTZ,
    last_verified_status INT,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 11. ASSESSMENT ASSIGNMENTS (TARGET ROMBEL/STUDENTS)
CREATE TABLE IF NOT EXISTS assessment_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar'),
    UNIQUE(assessment_id, class_id)
);

-- 12. ASSESSMENT SCHEDULES
CREATE TABLE IF NOT EXISTS assessment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 60,
    timezone VARCHAR(50) DEFAULT 'Asia/Makassar',
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 13. ASSESSMENT PARTICIPATIONS
CREATE TABLE IF NOT EXISTS assessment_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    opened_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    attendance_status VARCHAR(30) DEFAULT 'belum_mengerjakan'
      CHECK (attendance_status IN ('hadir', 'sakit', 'izin', 'tanpa_keterangan', 'belum_mengerjakan')),
    device_info TEXT,
    UNIQUE(assessment_id, student_id)
);

-- 14. ASSESSMENT SCORES
CREATE TABLE IF NOT EXISTS assessment_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    raw_score NUMERIC(5,2),
    max_score NUMERIC(5,2) DEFAULT 100.00,
    teacher_notes TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar'),
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar'),
    UNIQUE(assessment_id, student_id)
);

-- 15. ASSESSMENT RESULTS IMPORTS
CREATE TABLE IF NOT EXISTS assessment_results_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    total_rows INT DEFAULT 0,
    success_rows INT DEFAULT 0,
    failed_rows INT DEFAULT 0,
    imported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    logs JSONB,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 16. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'sistem',
    target_role user_role_enum,
    target_class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 17. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_audience VARCHAR(50) DEFAULT 'Semua',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 19. INTEGRATION PROVIDERS
CREATE TABLE IF NOT EXISTS integration_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT FALSE,
    auth_type VARCHAR(50) DEFAULT 'api_key',
    config_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- 20. INTEGRATION SYNC LOGS
CREATE TABLE IF NOT EXISTS integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES integration_providers(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL,
    records_synced INT DEFAULT 0,
    error_message TEXT,
    synced_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Makassar')
);

-- INDICES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_assessments_level_cat ON assessments(level, category_id);
CREATE INDEX IF NOT EXISTS idx_assessments_teacher ON assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_assessment ON assessment_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_student ON assessment_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at DESC);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;

-- 1. Profiles policy: Users see own profile, admins see all
CREATE POLICY "Public profile view" ON profiles FOR SELECT USING (true);

-- 2. Assessments policy: Students only see non-draft assessments for their class level
CREATE POLICY "Assessments student view" ON assessments FOR SELECT
  USING (status != 'draft');

-- 3. Assessment Scores policy: Students can only view their own score if published
CREATE POLICY "Student personal score view" ON assessment_scores FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    AND assessment_id IN (SELECT id FROM assessments WHERE is_score_published = true)
  );
