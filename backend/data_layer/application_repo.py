import datetime

from Models import Application, Employer, JobDescription, JobSeeker


class ApplicationRepository:
    def get_by_job_id(self, job_id):
        return JobDescription.get_or_none(JobDescription.jobId == job_id)

    def get_by_seeker_id(self, seeker_id):
        return JobSeeker.get_or_none(JobSeeker.jobSeekerId == seeker_id)

    def get_latest_by_job_and_seeker(self, job, seeker):
        return list(
            Application.select()
            .where((Application.job == job) & (Application.jobSeeker == seeker))
            .order_by(Application.applied_at.desc(), Application.applicationId.desc())
        )

    def create_application(self, seeker, job, analysis, snapshot):
        return Application.create(
            jobSeeker=seeker,
            job=job,
            status="Pending",
            match_score=analysis["score"],
            ai_summary=analysis.get("summary"),
            ai_recommendation=analysis.get("recommendation"),
            **snapshot,
        )

    def reactivate_application(self, application, analysis, snapshot):
        application.status = "Pending"
        application.match_score = analysis["score"]
        application.ai_summary = analysis.get("summary")
        application.ai_recommendation = analysis.get("recommendation")
        application.applied_at = datetime.datetime.now()
        for field, value in snapshot.items():
            setattr(application, field, value)
        application.save()
        return application

    def increment_job_applicants(self, job, amount=1):
        job.currentApplicants = (job.currentApplicants or 0) + amount
        job.save()

    def decrement_job_applicants(self, job, amount=1):
        job.currentApplicants = max((job.currentApplicants or 0) - amount, 0)
        job.save()

    def mark_withdrawn(self, applications):
        for application in applications:
            application.status = "Withdrawn"
            application.save()

    def find_application_for_employer(self, application_id, employer_id):
        return (
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

    def update_ai_analysis(self, application, analysis, snapshot):
        if not application.match_score or application.match_score <= 0:
            application.match_score = analysis["score"]
        application.ai_summary = analysis.get("summary") or application.ai_summary
        application.ai_recommendation = analysis.get("recommendation") or application.ai_recommendation
        for field, value in snapshot.items():
            if value and not getattr(application, field, None):
                setattr(application, field, value)
        application.save()
        return application
