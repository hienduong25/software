from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from business_layer.ai_service import AIService
from business_layer.exceptions import BusinessError

router = APIRouter(prefix="", tags=["AI"])
service = AIService()


def _run_business(callable_obj):
    try:
        return callable_obj()
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)


class AnalyzeCVRequest(BaseModel):
    # Thông tin ứng viên
    fullName: Optional[str] = None
    email: Optional[str] = None
    title: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    cv_content: Optional[str] = None
    cv_url: Optional[str] = None

    # Thông tin công việc
    jobTitle: Optional[str] = None
    jobDescription: Optional[str] = None
    jobRequirements: Optional[str] = None
    jobLocation: Optional[str] = None
    salaryRange: Optional[str] = None


@router.post("/analyze")
def analyze_cv(data: AnalyzeCVRequest):
    """
    Phân tích mức độ phù hợp giữa CV ứng viên và công việc bằng AI.
    Trả về score (0-100), summary, strengths, weaknesses.
    """
    payload = data.dict(exclude_none=True)
    return _run_business(lambda: service.analyze_payload(payload))
