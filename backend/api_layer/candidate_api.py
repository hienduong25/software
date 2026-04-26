from fastapi import APIRouter, HTTPException
from business_layer.job_seeker_service import JobSeekerService

router = APIRouter(prefix="", tags=["Candidates"])
service = JobSeekerService()

@router.get("/")
def get_candidates():
    return service.get_public_seekers()

@router.get("/{id}")
def get_candidate(id: int):
    candidate = service.get_public_seeker_by_id(id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return candidate
