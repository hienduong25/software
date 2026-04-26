import shutil
import uuid
from pathlib import Path
from fastapi import UploadFile

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_ROOT = BASE_DIR.parent.parent / "uploads"
AVATAR_DIR = UPLOAD_ROOT / "avatars"

AVATAR_DIR.mkdir(parents=True, exist_ok=True)


def save_avatar_upload(file: UploadFile) -> str:
    ext = Path(file.filename).suffix or ""
    filename = f"{uuid.uuid4().hex}{ext}"
    target_path = AVATAR_DIR / filename
    with target_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/uploads/avatars/{filename}"
