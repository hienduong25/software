import os
import uvicorn
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from libs.startup import close_database, initialize_database

# Import các tầng API
from api_layer.job_api import router as job_router
from api_layer.auth_api import router as auth_router
from api_layer.candidate_api import router as candidate_router
from api_layer.seeker_api import router as seeker_router
from api_layer.employer_api import router as employer_router
from api_layer.ai_api import router as ai_router

# --- Quản lý vòng đời ứng dụng (Lifespan) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        initialize_database()
        print("🚀 [HỆ THỐNG] Kết nối MySQL Aiven & Cập nhật bảng thành công!")
    except Exception as e:
        print(f"❌ [LỖI] Khởi tạo hệ thống thất bại: {e}")
    
    yield # Server vận hành...
    
    close_database()
    print("🔌 [HỆ THỐNG] Đã ngắt kết nối an toàn.")

# --- Khởi tạo FastAPI ---
app = FastAPI(
    title="AI Job Portal API",
    version="2.1.0",
    lifespan=lifespan
)

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# --- Cấu hình CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Cho phép tất cả để tránh lỗi khi dev, hoặc giữ list localhost của bạn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Đăng ký Router ---
# Lưu ý: Nếu trong file router bạn đã để prefix rồi thì không cần để ở đây, 
# nhưng để chắc chắn, mình gom về /api cho chuyên nghiệp.
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(job_router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(candidate_router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(seeker_router, prefix="/api/seeker", tags=["Seeker"])
app.include_router(employer_router, prefix="/api/employer", tags=["Employer"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])

@app.get("/")
def home():
    return {"status": "Online", "database": "Connected"}

# --- Khởi chạy ---
if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    reload_enabled = os.getenv("UVICORN_RELOAD", "true").lower() == "true"

    print(f"""
    ================================================
    🌟 BACKEND AI JOB PORTAL - CLOUD DATABASE READY
    📍 Swagger UI: http://{host}:{port}/docs
    ================================================
    """)
    uvicorn.run("main:app", host=host, port=port, reload=reload_enabled)
