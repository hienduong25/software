from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from business_layer.auth_service import AuthService
from business_layer.exceptions import BusinessError

router = APIRouter(tags=["Auth"])
service = AuthService()

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "seeker"  # seeker hoặc employer
    company_name: str = None  # Bắt buộc cho employer

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "seeker"  # seeker hoặc employer

@router.post("/register")
async def register(data: RegisterRequest):
    try:
        return service.register(data)
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except Exception as e:
        print(f"❌ Lỗi Register: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi tạo tài khoản")

@router.post("/login")
async def login(data: LoginRequest):
    try:
        return service.login(data)
    except BusinessError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    except Exception as e:
        print(f"❌ Lỗi Login: {e}")
        raise HTTPException(status_code=500, detail="Lỗi xử lý đăng nhập")
