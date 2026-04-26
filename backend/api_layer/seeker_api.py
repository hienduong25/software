from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from pydantic import BaseModel
from business_layer.avatar_service import AvatarService
from business_layer.exceptions import BusinessError
from business_layer.job_seeker_service import JobSeekerService
from business_layer.job_service import JobService

router = APIRouter(tags=["Seeker"])
service = JobSeekerService()
job_service = JobService()
avatar_service = AvatarService()

class SeekerProfileUpdate(BaseModel):
    full_name: str | None = None
    title: str | None = None
    avatar: str | None = None
    emailUpdates: bool | None = None
    phone: str | None = None
    skills: str | None = None
    experience: str | None = None
    cv_content: str | None = None
    cv_url: str | None = None

@router.get("/profile/{seeker_id}")
def get_seeker_profile(seeker_id: int):
    try:
        return service.require_public_seeker(seeker_id)
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

@router.put("/profile/{seeker_id}")
def update_seeker_profile(seeker_id: int, data: SeekerProfileUpdate):
    try:
        return service.update_public_seeker_profile(seeker_id, data.dict())
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

@router.get("/profile/{seeker_id}/applications")
def get_seeker_applications(seeker_id: int):
    try:
        return job_service.get_applications_for_seeker(seeker_id, service)
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

@router.post("/profile/{seeker_id}/avatar")
async def upload_seeker_avatar(
    request: Request,
    seeker_id: int,
    avatar: UploadFile = File(...),
):
    base_url = str(request.base_url).rstrip("/")
    try:
        service.require_public_seeker(seeker_id)
        absolute_url = avatar_service.upload_avatar(base_url, avatar)
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

    service.update_seeker_profile(seeker_id, {"avatar": absolute_url})
    return {"avatar": absolute_url}
