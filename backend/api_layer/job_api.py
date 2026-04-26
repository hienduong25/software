from fastapi import APIRouter, Body, HTTPException, Query
from api_layer.schemas.job_schemas import (
    ApplyJobRequest,
    CreateJobRequest,
    PreviewJobMatchRequest,
    RecalculateApplicationMatchRequest,
    UpdateApplicationStatusRequest,
    UpdateJobRequest,
    WithdrawJobRequest,
)
from business_layer.exceptions import BusinessError
from business_layer.job_service import JobService

router = APIRouter(prefix="", tags=["Jobs"])
service = JobService()


def _run_business(callable_obj):
    try:
        return callable_obj()
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

@router.get("/")
def list_jobs():
    return service.get_all_jobs()

@router.get("/{id}")
def get_job(id: int):
    return _run_business(lambda: service.get_job_by_id(id))

@router.post("/")
def create_job(job_data: CreateJobRequest):
    return _run_business(lambda: service.create_job_result(job_data.dict()))


@router.post("/{id}/preview-match")
def preview_job_match(id: int, data: PreviewJobMatchRequest):
    return _run_business(lambda: service.preview_job_match(id, data))

@router.post("/{id}/apply")
def apply_job(id: int, data: ApplyJobRequest):
    return _run_business(lambda: service.apply_job(id, data))

@router.delete("/{id}/apply")
def withdraw_job_application(
    id: int,
    data: WithdrawJobRequest | None = Body(default=None),
    jobSeekerId: int | None = Query(default=None),
):
    seeker_id = jobSeekerId or (data.jobSeekerId if data else None)
    return _run_business(lambda: service.withdraw_job_application(id, seeker_id))

@router.put("/applications/{application_id}/status")
def update_application_status(application_id: int, data: UpdateApplicationStatusRequest):
    return _run_business(
        lambda: service.update_application_status_result(
            application_id,
            data.employerId,
            data.status,
        )
    )

@router.put("/applications/{application_id}/match-score")
def recalculate_application_match_score(application_id: int, data: RecalculateApplicationMatchRequest):
    return _run_business(
        lambda: service.recalculate_application_match_score(application_id, data.employerId)
    )

@router.put("/{id}")
def update_job(id: int, data: UpdateJobRequest):
    return _run_business(lambda: service.update_job_result(id, data.dict(exclude_unset=True)))

@router.delete("/{id}")
def delete_job(id: int):
    return _run_business(lambda: service.delete_job_result(id))
