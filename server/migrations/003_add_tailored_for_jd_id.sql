-- Migration 003: Add tailored_for_jd_id column to resumes table

ALTER TABLE resumes ADD COLUMN IF NOT EXISTS tailored_for_jd_id INT NULL;
ALTER TABLE resumes ADD CONSTRAINT fk_resumes_tailored_jd FOREIGN KEY IF NOT EXISTS (tailored_for_jd_id) REFERENCES job_descriptions(id) ON DELETE SET NULL;
