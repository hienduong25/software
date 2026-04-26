from data_layer.job_repo import JobRepository
from business_layer.application_service import ApplicationService
from business_layer.exceptions import NotFoundError, ValidationError

class JobService:
    def __init__(self):
        self.repo = JobRepository()
        self.application_service = ApplicationService()

    def get_all_jobs(self):
        return self.repo.get_all()

    def get_job_by_id(self, job_id):
        job = self.repo.get_by_id(job_id)
        if not job:
            raise NotFoundError("Job not found")
        return job

    def create_job(self, job_data):
        try:
            return self.repo.create(job_data)
        except Exception as error:
            raise ValidationError(str(error))

    def create_job_result(self, job_data):
        job = self.create_job(job_data)
        return {
            "success": True,
            "message": "Job posted successfully",
            "jobId": job.jobId,
        }

    def update_job(self, job_id, job_data):
        updated_job = self.repo.update(job_id, job_data)
        if not updated_job:
            raise NotFoundError("Job not found")
        return updated_job

    def get_applicants_by_employer(self, employer_id):
        return self.repo.get_applicants_by_employer(employer_id)

    def get_applications_by_seeker(self, seeker_id):
        return self.repo.get_applications_by_seeker(seeker_id)

    def update_application_status(self, application_id, employer_id, status):
        return self.application_service.update_application_status(
            application_id,
            employer_id,
            status,
            self.repo,
        )

    def update_application_status_result(self, application_id, employer_id, status):
        updated_application = self.update_application_status(application_id, employer_id, status)
        return {
            "success": True,
            "message": "Application status updated successfully",
            "application": updated_application,
        }

    def delete_job(self, job_id):
        deleted = self.repo.delete(job_id)
        if not deleted:
            raise NotFoundError("Job not found")
        return deleted

    def delete_job_result(self, job_id):
        self.delete_job(job_id)
        return {
            "success": True,
            "message": "Job deleted successfully",
        }

    def preview_job_match(self, job_id, data):
        return self.application_service.preview_job_match(job_id, data)

    def apply_job(self, job_id, data):
        return self.application_service.apply_job(job_id, data)

    def withdraw_job_application(self, job_id, seeker_id):
        return self.application_service.withdraw_job_application(job_id, seeker_id)

    def recalculate_application_match_score(self, application_id, employer_id):
        return self.application_service.recalculate_application_match_score(application_id, employer_id)

    def update_job_result(self, job_id, job_data):
        updated_job = self.update_job(job_id, job_data)
        return {
            "success": True,
            "message": "Job updated successfully",
            "job": updated_job,
        }

    def get_applications_for_seeker(self, seeker_id, seeker_service):
        seeker_service.require_public_seeker(seeker_id)
        return self.get_applications_by_seeker(seeker_id)

    def get_applicants_for_employer(self, employer_id, employer_service):
        employer_service.require_public_employer(employer_id)
        return self.get_applicants_by_employer(employer_id)
