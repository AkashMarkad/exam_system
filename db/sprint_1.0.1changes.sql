-- Queries for exam_system database

-- Create database if not exists
-- (Note: PostgreSQL does not have IF NOT EXISTS for CREATE DATABASE in older versions, but we can use DO block)
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'exam_system') THEN
      PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE exam_system');
   END IF;
END
$$;

-- TABLE: users
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index on role for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- TABLE: exam
CREATE TABLE IF NOT EXISTS exam (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    duration_minutes INT CHECK(duration_minutes > 0),
    total_marks INT CHECK(total_marks >= 0),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Index on start_time and created_by for performance
CREATE INDEX IF NOT EXISTS idx_exam_start_time ON exam(start_time);
CREATE INDEX IF NOT EXISTS idx_exam_created_by ON exam(created_by);

-- TABLE: question
CREATE TABLE IF NOT EXISTS question (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    marks INT NOT NULL CHECK(marks >= 0),
    CONSTRAINT fk_question_exam FOREIGN KEY (exam_id) REFERENCES exam(id) ON DELETE CASCADE
);

-- Index on exam_id for fetching questions by exam
CREATE INDEX IF NOT EXISTS idx_question_exam_id ON question(exam_id);

-- TABLE: option
CREATE TABLE IF NOT EXISTS option (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
);

-- Index on question_id for fetching options by question
CREATE INDEX IF NOT EXISTS idx_option_question_id ON option(question_id);

-- TABLE: exam_attempt
CREATE TABLE IF NOT EXISTS exam_attempt (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    score INT CHECK(score >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    CONSTRAINT fk_attempt_exam FOREIGN KEY (exam_id) REFERENCES exam(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes on user_id and exam_id for faster queries
CREATE INDEX IF NOT EXISTS idx_exam_attempt_user_id ON exam_attempt(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempt_exam_id ON exam_attempt(exam_id);

-- TABLE: user_answer
CREATE TABLE IF NOT EXISTS user_answer (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option_id BIGINT,
    CONSTRAINT fk_answer_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempt(id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_option FOREIGN KEY (selected_option_id) REFERENCES option(id) ON DELETE SET NULL
);

-- Index on attempt_id for fetching answers quickly
CREATE INDEX IF NOT EXISTS idx_user_answer_attempt_id ON user_answer(attempt_id);
CREATE INDEX IF NOT EXISTS idx_user_answer_question_id ON user_answer(question_id); 