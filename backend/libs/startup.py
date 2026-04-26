from libs.database import db

from Models.application import Application
from Models.employer import Employer
from Models.job import JobDescription
from Models.job_seeker import JobSeeker


def _ensure_column(table_name: str, column_name: str, definition: str):
    existing = [
        row[0] for row in db.execute_sql(f"SHOW COLUMNS FROM {table_name}").fetchall()
    ]
    if column_name not in existing:
        db.execute_sql(f"ALTER TABLE {table_name} ADD COLUMN {definition}")


def _ensure_longtext_column(table_name: str, column_name: str):
    rows = db.execute_sql(
        f"SHOW FULL COLUMNS FROM {table_name} WHERE Field = '{column_name}'"
    ).fetchall()
    if not rows:
        return
    column_type = rows[0][1].lower()
    if column_type != "longtext":
        db.execute_sql(
            f"ALTER TABLE {table_name} MODIFY COLUMN {column_name} LONGTEXT NULL"
        )


def _ensure_job_seeker_schema():
    _ensure_column("job_seekers", "title", "title VARCHAR(255) NULL")
    _ensure_column("job_seekers", "avatar", "avatar LONGTEXT NULL")
    _ensure_column(
        "job_seekers",
        "emailUpdates",
        "emailUpdates TINYINT(1) NOT NULL DEFAULT 1",
    )
    _ensure_longtext_column("job_seekers", "avatar")


def _ensure_employer_schema():
    _ensure_column("employers", "title", "title VARCHAR(255) NULL")
    _ensure_column("employers", "avatar", "avatar LONGTEXT NULL")
    _ensure_column(
        "employers", "emailUpdates", "emailUpdates TINYINT(1) NOT NULL DEFAULT 1"
    )
    _ensure_longtext_column("employers", "avatar")


def _ensure_job_schema():
    _ensure_column("jobs", "requirements", "requirements TEXT NULL")
    _ensure_column("jobs", "location", "location VARCHAR(255) NULL")
    _ensure_column("jobs", "salary_range", "salary_range VARCHAR(255) NULL")
    _ensure_column("jobs", "maxApplicants", "maxApplicants INT NOT NULL DEFAULT 10")
    _ensure_column(
        "jobs", "currentApplicants", "currentApplicants INT NOT NULL DEFAULT 0"
    )
    _ensure_column(
        "jobs", "created_at", "created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
    )

    # Dam bao khoa ngoai employerId xoa CASCADE khi xoa employer.
    try:
        fk_rows = db.execute_sql(
            "SELECT CONSTRAINT_NAME, DELETE_RULE FROM information_schema.REFERENTIAL_CONSTRAINTS "
            "WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'jobs' "
            "AND REFERENCED_TABLE_NAME = 'employers'"
        ).fetchall()
        for fk_name, delete_rule in fk_rows:
            if delete_rule.upper() != "CASCADE":
                db.execute_sql(f"ALTER TABLE jobs DROP FOREIGN KEY {fk_name}")
                db.execute_sql(
                    "ALTER TABLE jobs "
                    "ADD CONSTRAINT jobs_ibfk_1 FOREIGN KEY (employerId) "
                    "REFERENCES employers(employerId) ON DELETE CASCADE"
                )
    except Exception:
        pass


def _ensure_application_schema():
    _ensure_column("applications", "ai_summary", "ai_summary TEXT NULL")
    _ensure_column("applications", "ai_recommendation", "ai_recommendation TEXT NULL")
    _ensure_column(
        "applications", "submitted_cv_name", "submitted_cv_name VARCHAR(255) NULL"
    )
    _ensure_column(
        "applications",
        "submitted_full_name",
        "submitted_full_name VARCHAR(255) NULL",
    )
    _ensure_column(
        "applications", "submitted_email", "submitted_email VARCHAR(255) NULL"
    )
    _ensure_column(
        "applications", "submitted_phone", "submitted_phone VARCHAR(255) NULL"
    )
    _ensure_column(
        "applications", "submitted_title", "submitted_title VARCHAR(255) NULL"
    )
    _ensure_column(
        "applications", "submitted_avatar", "submitted_avatar LONGTEXT NULL"
    )
    _ensure_column("applications", "submitted_skills", "submitted_skills TEXT NULL")
    _ensure_column(
        "applications", "submitted_experience", "submitted_experience TEXT NULL"
    )
    _ensure_column(
        "applications", "submitted_cv_content", "submitted_cv_content TEXT NULL"
    )
    _ensure_column(
        "applications", "submitted_cv_url", "submitted_cv_url VARCHAR(255) NULL"
    )


def initialize_database():
    if db.is_closed():
        db.connect()

    db.create_tables([Employer, JobSeeker, JobDescription, Application])
    _ensure_job_seeker_schema()
    _ensure_employer_schema()
    _ensure_job_schema()
    _ensure_application_schema()


def close_database():
    if not db.is_closed():
        db.close()
