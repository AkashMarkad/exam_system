-- Backout queries

-- DROP INDEXES (if exist)
DROP INDEX IF EXISTS idx_user_answer_question_id;
DROP INDEX IF EXISTS idx_user_answer_attempt_id;

DROP INDEX IF EXISTS idx_exam_attempt_exam_id;
DROP INDEX IF EXISTS idx_exam_attempt_user_id;

DROP INDEX IF EXISTS idx_option_question_id;

DROP INDEX IF EXISTS idx_question_exam_id;

DROP INDEX IF EXISTS idx_exam_created_by;
DROP INDEX IF EXISTS idx_exam_start_time;

DROP INDEX IF EXISTS idx_users_role;

-- DROP TABLES (in order to avoid foreign key conflicts)
DROP TABLE IF EXISTS user_answer CASCADE;
DROP TABLE IF EXISTS exam_attempt CASCADE;
DROP TABLE IF EXISTS option CASCADE;
DROP TABLE IF EXISTS question CASCADE;
DROP TABLE IF EXISTS exam CASCADE;
DROP TABLE IF EXISTS users CASCADE;