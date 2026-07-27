-- Database Schema for HireSetu

CREATE DATABASE IF NOT EXISTS resumeai_builder;
USE resumeai_builder;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(500) NULL,
    linkedin_url VARCHAR(500) NULL,
    github_url VARCHAR(500) NULL,
    portfolio_url VARCHAR(500) NULL,
    bio VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    raw_extracted_text LONGTEXT NULL,
    ats_analysis JSON NULL,
    tailored_for_jd_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tailored_for_jd_id) REFERENCES job_descriptions(id) ON DELETE SET NULL,
    INDEX idx_resumes_user_id (user_id),
    INDEX idx_resumes_tailored_jd (tailored_for_jd_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resume Sections Table
CREATE TABLE IF NOT EXISTS resume_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    section_type ENUM(
        'personal_info',
        'education',
        'experience',
        'projects',
        'skills',
        'certifications',
        'achievements',
        'positions_of_responsibility',
        'languages',
        'interests'
    ) NOT NULL,
    content JSON NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_sections_resume_id (resume_id),
    INDEX idx_sections_sort (resume_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Descriptions Table
CREATE TABLE IF NOT EXISTS job_descriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    title VARCHAR(255) NULL,
    raw_text LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_jd_resume_id (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

