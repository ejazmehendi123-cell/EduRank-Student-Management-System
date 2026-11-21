-- Initial Schema Migration for Student Management System

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_roll_number ON student_profiles(roll_number);
CREATE INDEX idx_student_profiles_total_points ON student_profiles(total_points DESC);

-- 3. Point Transactions Table
CREATE TABLE IF NOT EXISTS point_transactions (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES users(id),
    points INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_point_transactions_student_id ON point_transactions(student_id);
CREATE INDEX idx_point_transactions_teacher_id ON point_transactions(teacher_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- 4. Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- Default Demo Data:
-- Password for all seed accounts is: Password@123
-- BCrypt hash: $2a$10$47.vcIsAa45j3RraQcItjeYmkE3ll5Kw5kuFOa2j54WsF.8IbJahq
INSERT INTO users (id, name, email, password, role, enabled, created_at, updated_at)
VALUES 
(1, 'Professor Sharma', 'teacher@school.edu', '$2a$10$47.vcIsAa45j3RraQcItjeYmkE3ll5Kw5kuFOa2j54WsF.8IbJahq', 'TEACHER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Rahul Verma', 'rahul@student.edu', '$2a$10$47.vcIsAa45j3RraQcItjeYmkE3ll5Kw5kuFOa2j54WsF.8IbJahq', 'STUDENT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Priya Nair', 'priya@student.edu', '$2a$10$47.vcIsAa45j3RraQcItjeYmkE3ll5Kw5kuFOa2j54WsF.8IbJahq', 'STUDENT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Amit Patel', 'amit@student.edu', '$2a$10$47.vcIsAa45j3RraQcItjeYmkE3ll5Kw5kuFOa2j54WsF.8IbJahq', 'STUDENT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Sneha Rao', 'sneha@student.edu', '$2a$10$47.vcIsAa45j3RraQcItjeYmkE3ll5Kw5kuFOa2j54WsF.8IbJahq', 'STUDENT', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

INSERT INTO student_profiles (id, user_id, roll_number, department, semester, total_points, created_at)
VALUES
(1, 2, 'CS2026-001', 'Computer Science', 6, 950, CURRENT_TIMESTAMP),
(2, 3, 'CS2026-002', 'Computer Science', 6, 900, CURRENT_TIMESTAMP),
(3, 4, 'EC2026-015', 'Electronics', 6, 900, CURRENT_TIMESTAMP),
(4, 5, 'ME2026-042', 'Mechanical', 6, 850, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

SELECT setval('student_profiles_id_seq', (SELECT MAX(id) FROM student_profiles));

-- Seed initial point awards
INSERT INTO point_transactions (student_id, teacher_id, points, transaction_type, reason, created_at)
VALUES
(1, 1, 950, 'AWARD', 'First place in Annual Hackathon and stellar academic record', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 1, 900, 'AWARD', 'Excellent AI research project and consistent performance', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 1, 900, 'AWARD', 'Robotics championship finalist and lab leadership', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 1, 850, 'AWARD', 'Distinction in CAD/CAM design and technical paper presentation', CURRENT_TIMESTAMP - INTERVAL '5 days');
