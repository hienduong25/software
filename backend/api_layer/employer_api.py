from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from pydantic import BaseModel
from business_layer.avatar_service import AvatarService
from business_layer.exceptions import BusinessError
from business_layer.employer_service import EmployerService
from business_layer.job_service import JobService

router = APIRouter(tags=["Employer"])
service = EmployerService()
job_service = JobService()
avatar_service = AvatarService()

class EmployerProfileUpdate(BaseModel):
    companyName: str | None = None
    title: str | None = None
    industry: str | None = None
    address: str | None = None
    description: str | None = None
    avatar: str | None = None
    emailUpdates: bool | None = None

@router.get("/profile/{employer_id}")
def get_employer_profile(employer_id: int):
    try:
        return service.require_public_employer(employer_id)
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

@router.put("/profile/{employer_id}")
def update_employer_profile(employer_id: int, data: EmployerProfileUpdate):
    try:
        return service.update_public_employer_profile(employer_id, data.dict())
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

@router.get("/profile/{employer_id}/applicants")
def get_employer_applicants(employer_id: int):
    try:
        return job_service.get_applicants_for_employer(employer_id, service)
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

@router.post("/profile/{employer_id}/avatar")
async def upload_employer_avatar(
    request: Request,
    employer_id: int,
    avatar: UploadFile = File(...),
):
    base_url = str(request.base_url).rstrip("/")
    try:
        service.require_public_employer(employer_id)
        absolute_url = avatar_service.upload_avatar(base_url, avatar)
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

    service.update_employer_profile(employer_id, {"avatar": absolute_url})
    return {"avatar": absolute_url}
