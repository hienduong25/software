from pydantic import BaseModel


class CreateJobRequest(BaseModel):
    title: str
    description: str
    requirements: str | None = None
    location: str | None = None
    salary_range: str | None = None
    employer: int
    maxApplicants: int = 10


class ApplyJobRequest(BaseModel):
    jobSeekerId: int
    name: str | None = None
    fullName: str | None = None
    email: str | None = None
    phone: str | None = None
    title: str | None = None
    avatar: str | None = None
    skills: str | list[str] | None = None
    experience: str | None = None
    summary: str | None = None
    cv_content: str | None = None
    cv_url: str | None = None
    cvUrl: str | None = None


class PreviewJobMatchRequest(ApplyJobRequest):
    pass


class WithdrawJobRequest(BaseModel):
    jobSeekerId: int | None = None


class UpdateApplicationStatusRequest(BaseModel):
    employerId: int
    status: str


class RecalculateApplicationMatchRequest(BaseModel):
    employerId: int


class UpdateJobRequest(BaseModel):
    title: str
    description: str
    requirements: str | None = None
    location: str | None = None
    salary_range: str | None = None
    maxApplicants: int | None = None
