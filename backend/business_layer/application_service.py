from data_layer.application_repo import ApplicationRepository
from business_layer.ai_service import AIService
from business_layer.exceptions import NotFoundError, ValidationError


class ApplicationService:
    ALLOWED_APPLICATION_STATUSES = {"Pending", "Accepted", "Rejected"}

    def __init__(self):
        self.ai_service = AIService()
        self.repo = ApplicationRepository()

    def _get_job_or_raise(self, job_id):
        job = self.repo.get_by_job_id(job_id)
        if not job:
            raise NotFoundError("Job not found")
        return job

    def _get_seeker_or_raise(self, seeker_id):
        seeker = self.repo.get_by_seeker_id(seeker_id)
        if not seeker:
            raise NotFoundError("Job seeker not found")
        return seeker

    def _stringify_skills(self, value):
        if isinstance(value, list):
            return ", ".join([str(item).strip() for item in value if str(item).strip()])
        return value

    def _application_cv_snapshot(self, seeker, cv_data=None):
        cv_content = None
        cv_url = None
        if cv_data:
            cv_content = cv_data.cv_content or cv_data.summary
            cv_url = cv_data.cv_url or cv_data.cvUrl

        return {
            "submitted_cv_name": (cv_data.name if cv_data else None) or "CV đã nộp",
            "submitted_full_name": (cv_data.fullName if cv_data else None) or seeker.full_name,
            "submitted_email": (cv_data.email if cv_data else None) or seeker.email,
            "submitted_phone": (cv_data.phone if cv_data else None) or seeker.phone,
            "submitted_title": (cv_data.title if cv_data else None) or seeker.title,
            "submitted_avatar": (cv_data.avatar if cv_data else None) or seeker.avatar,
            "submitted_skills": self._stringify_skills((cv_data.skills if cv_data else None) or seeker.skills),
            "submitted_experience": (cv_data.experience if cv_data else None) or seeker.experience,
            "submitted_cv_content": cv_content or seeker.cv_content,
            "submitted_cv_url": cv_url or seeker.cv_url,
        }

    def _build_match_payload(self, seeker, job, snapshot):
        return {
            "fullName": snapshot.get("submitted_full_name") or seeker.full_name,
            "email": snapshot.get("submitted_email") or seeker.email,
            "title": snapshot.get("submitted_title") or seeker.title,
            "skills": snapshot.get("submitted_skills") or seeker.skills,
            "experience": snapshot.get("submitted_experience") or seeker.experience,
            "cv_content": snapshot.get("submitted_cv_content") or seeker.cv_content,
            "cv_url": snapshot.get("submitted_cv_url") or seeker.cv_url,
            "jobTitle": job.title,
            "jobDescription": job.description,
            "jobRequirements": job.requirements,
            "jobLocation": job.location,
            "salaryRange": job.salary_range,
        }

    def _analyze_application_match(self, seeker, job, snapshot):
        payload = self._build_match_payload(seeker, job, snapshot)
        analysis = self.ai_service.analyze_payload(payload)
        try:
            score = int(float(analysis.get("score", 0)))
        except (TypeError, ValueError):
            score = 0

        analysis["score"] = max(0, min(score, 100))
        return analysis

    def preview_job_match(self, job_id, data):
        job = self._get_job_or_raise(job_id)
        seeker = self._get_seeker_or_raise(data.jobSeekerId)
        snapshot = self._application_cv_snapshot(seeker, data)
        analysis = self._analyze_application_match(seeker, job, snapshot)
        return {
            "success": True,
            "jobId": job.jobId,
            "match_score": analysis["score"],
            "ai_summary": analysis.get("summary", ""),
            "strengths": analysis.get("strengths", []),
            "weaknesses": analysis.get("weaknesses", []),
            "analysis": analysis,
        }

    def apply_job(self, job_id, data):
        job = self._get_job_or_raise(job_id)
        seeker = self._get_seeker_or_raise(data.jobSeekerId)

        existing_applications = self.repo.get_latest_by_job_and_seeker(job, seeker)
        existing = existing_applications[0] if existing_applications else None
        active_existing = next(
            (application for application in existing_applications if application.status != "Withdrawn"),
            None,
        )
        if active_existing:
            raise ValidationError("Bạn đã ứng tuyển vào vị trí này rồi")

        if job.currentApplicants >= job.maxApplicants:
            raise ValidationError("Đã đạt tối đa số lượng ứng viên, không thể nộp thêm hồ sơ.")

        snapshot = self._application_cv_snapshot(seeker, data)
        analysis = self._analyze_application_match(seeker, job, snapshot)

        if existing and existing.status == "Withdrawn":
            application = self.repo.reactivate_application(existing, analysis, snapshot)
        else:
            application = self.repo.create_application(seeker, job, analysis, snapshot)

        self.repo.increment_job_applicants(job)

        return {
            "success": True,
            "message": "Applied successfully",
            "applicationId": application.applicationId,
            "match_score": application.match_score,
        }

    def withdraw_job_application(self, job_id, seeker_id):
        job = self._get_job_or_raise(job_id)
        if not seeker_id:
            raise ValidationError("Thiếu jobSeekerId để rút hồ sơ.")
        seeker = self._get_seeker_or_raise(seeker_id)

        applications = self.repo.get_latest_by_job_and_seeker(job, seeker)
        if not applications:
            raise NotFoundError("Bạn chưa ứng tuyển vào vị trí này")

        active_applications = [
            application for application in applications if application.status != "Withdrawn"
        ]
        if not active_applications:
            latest_application = applications[0]
            return {
                "success": True,
                "message": "Withdrawn successfully",
                "applicationId": latest_application.applicationId,
                "status": latest_application.status,
            }

        self.repo.mark_withdrawn(active_applications)
        self.repo.decrement_job_applicants(job, len(active_applications))

        latest_application = active_applications[0]
        return {
            "success": True,
            "message": "Withdrawn successfully",
            "applicationId": latest_application.applicationId,
            "status": "Withdrawn",
        }

    def update_application_status(self, application_id, employer_id, status, job_repo):
        if status not in self.ALLOWED_APPLICATION_STATUSES:
            raise ValidationError(
                "Trạng thái không hợp lệ. Chỉ chấp nhận Pending, Accepted hoặc Rejected."
            )

        updated_application = job_repo.update_application_status(application_id, employer_id, status)
        if not updated_application:
            raise NotFoundError("Không tìm thấy hồ sơ ứng tuyển hoặc bạn không có quyền cập nhật.")
        return updated_application

    def recalculate_application_match_score(self, application_id, employer_id):
        application = self.repo.find_application_for_employer(application_id, employer_id)
        if not application:
            raise NotFoundError("Không tìm thấy hồ sơ ứng tuyển hoặc bạn không có quyền cập nhật.")

        snapshot = {
            "submitted_cv_name": application.submitted_cv_name,
            "submitted_full_name": application.submitted_full_name,
            "submitted_email": application.submitted_email,
            "submitted_title": application.submitted_title,
            "submitted_skills": application.submitted_skills,
            "submitted_experience": application.submitted_experience,
            "submitted_cv_content": application.submitted_cv_content,
            "submitted_cv_url": application.submitted_cv_url,
        }

        if not any(snapshot.values()):
            snapshot = self._application_cv_snapshot(application.jobSeeker)

        analysis = self._analyze_application_match(application.jobSeeker, application.job, snapshot)
        application = self.repo.update_ai_analysis(application, analysis, snapshot)

        return {
            "success": True,
            "message": "AI match score recalculated successfully",
            "applicationId": application.applicationId,
            "match_score": application.match_score,
            "ai_summary": application.ai_summary,
            "strengths": analysis.get("strengths", []),
            "weaknesses": analysis.get("weaknesses", []),
            "analysis": analysis,
        }
