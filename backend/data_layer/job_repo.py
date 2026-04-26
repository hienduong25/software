from data_layer.base_repository import BaseRepository
from Models import JobDescription, Employer, JobSeeker, Application

class JobRepository(BaseRepository):
    def _serialize_job(self, job):
        data = {
            **job.__data__,
            "companyName": job.employer.companyName,
            "employerId": getattr(job.employer, "employerId", job.__data__.get("employer")),
        }
        data["status"] = (
            "Closed"
            if data.get("currentApplicants", 0) >= data.get("maxApplicants", 0)
            else "Active"
        )
        return data

    def get_all(self):
        query = (
            JobDescription
            .select(JobDescription, Employer)
            .join(Employer)
        )
        return [self._serialize_job(job) for job in query]

    def get_by_id(self, job_id):
        job = JobDescription.get_or_none(JobDescription.jobId == job_id)
        if not job:
            return None
        return self._serialize_job(job)

    def create(self, data):
        return JobDescription.create(**data)

    def update(self, job_id, data):
        job = JobDescription.get_or_none(JobDescription.jobId == job_id)
        if not job:
            return None
        JobDescription.update(**data).where(JobDescription.jobId == job_id).execute()
        return self.get_by_id(job_id)

    def delete(self, job_id):
        job = JobDescription.get_or_none(JobDescription.jobId == job_id)
        if not job:
            return None
        # Đảm bảo xóa trước các hồ sơ ứng tuyển liên quan nếu FK không được cấu hình cascade đủ
        Application.delete().where(Application.job == job).execute()
        job.delete_instance()
        return True

    def _serialize_application(self, application):
        applied_at = application.applied_at.isoformat() if application.applied_at else None
        company_name = getattr(application.job.employer, "companyName", None)

        return {
            "applicationId": application.applicationId,
            "status": application.status,
            "match_score": application.match_score,
            "score": application.match_score,
            "ai_summary": application.ai_summary,
            "ai_recommendation": application.ai_recommendation,
            "applied_at": applied_at,
            "appliedAt": applied_at,
            "jobId": application.job.jobId,
            "jobTitle": application.job.title,
            "jobSeekerId": application.jobSeeker.jobSeekerId,
            "companyName": company_name,
            "company": company_name,
            "location": application.job.location,
            "salary_range": application.job.salary_range,
            "salary": application.job.salary_range,
            "full_name": application.submitted_full_name or application.jobSeeker.full_name,
            "email": application.submitted_email or application.jobSeeker.email,
            "phone": application.submitted_phone or application.jobSeeker.phone,
            "title": application.submitted_title or application.jobSeeker.title,
            "avatar": application.submitted_avatar or application.jobSeeker.avatar,
            "skills": application.submitted_skills or application.jobSeeker.skills,
            "experience": application.submitted_experience or application.jobSeeker.experience,
            "cv_content": application.submitted_cv_content or application.jobSeeker.cv_content,
            "cv_url": application.submitted_cv_url or application.jobSeeker.cv_url,
            "submitted_cv_name": application.submitted_cv_name,
            "cvName": application.submitted_cv_name or "CV đã nộp",
            "cvMethod": "CV đã nộp",
        }

    def _dedupe_latest_applications(self, applications, key_builder):
        latest_by_key = {}
        for application in applications:
            key = key_builder(application)
            current = latest_by_key.get(key)
            if not current:
                latest_by_key[key] = application
                continue

            current_applied_at = current.applied_at or 0
            next_applied_at = application.applied_at or 0
            if (
                next_applied_at > current_applied_at or
                (
                    next_applied_at == current_applied_at and
                    application.applicationId > current.applicationId
                )
            ):
                latest_by_key[key] = application

        return sorted(
            latest_by_key.values(),
            key=lambda application: (
                application.applied_at or 0,
                application.applicationId or 0,
            ),
            reverse=True,
        )

    def get_applicants_by_employer(self, employer_id):
        query = (
            Application
            .select(Application, JobSeeker, JobDescription, Employer)
            .join(JobSeeker)
            .switch(Application)
            .join(JobDescription)
            .join(Employer)
            .where(
                (JobDescription.employer == employer_id) &
                (Application.status != "Withdrawn")
            )
            .order_by(Application.applied_at.desc(), Application.applicationId.desc())
        )
        latest_applications = self._dedupe_latest_applications(
            query,
            lambda application: (
                application.jobSeeker.jobSeekerId,
                application.job.jobId,
            ),
        )
        return [self._serialize_application(application) for application in latest_applications]

    def get_applications_by_seeker(self, seeker_id):
        query = (
            Application
            .select(Application, JobSeeker, JobDescription, Employer)
            .join(JobSeeker)
            .switch(Application)
            .join(JobDescription)
            .join(Employer)
            .where(
                (Application.jobSeeker == seeker_id) &
                (Application.status != "Withdrawn")
            )
            .order_by(Application.applied_at.desc(), Application.applicationId.desc())
        )
        latest_applications = self._dedupe_latest_applications(
            query,
            lambda application: application.job.jobId,
        )
        return [self._serialize_application(application) for application in latest_applications]

    def update_application_status(self, application_id, employer_id, status):
        application = (
            Application
            .select(Application, JobSeeker, JobDescription)
            .join(JobSeeker)
            .switch(Application)
            .join(JobDescription)
            .where(
                (Application.applicationId == application_id) &
                (JobDescription.employer == employer_id)
            )
            .first()
        )
        if not application:
            return None

        previous_status = application.status or "Pending"
        next_status = status
        job = application.job

        slot_consuming_statuses = {"Pending", "Accepted"}
        was_consuming_slot = previous_status in slot_consuming_statuses
        will_consume_slot = next_status in slot_consuming_statuses

        if not was_consuming_slot and will_consume_slot:
            current_applicants = job.currentApplicants or 0
            max_applicants = job.maxApplicants or 0
            if max_applicants > 0 and current_applicants >= max_applicants:
                raise ValueError("Đã đạt tối đa số lượng ứng viên cho công việc này.")
            job.currentApplicants = current_applicants + 1
            job.save()
        elif was_consuming_slot and not will_consume_slot:
            job.currentApplicants = max((job.currentApplicants or 0) - 1, 0)
            job.save()

        application.status = next_status
        application.save()

        refreshed_application = (
            Application
            .select(Application, JobSeeker, JobDescription)
            .join(JobSeeker)
            .switch(Application)
            .join(JobDescription)
            .where(Application.applicationId == application_id)
            .first()
        )
        return self._serialize_application(refreshed_application)
