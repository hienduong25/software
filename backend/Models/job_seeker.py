from peewee import AutoField, BooleanField, CharField, TextField
from Models.base import BaseModel

class JobSeeker(BaseModel):
    jobSeekerId = AutoField(primary_key=True)
    full_name = CharField()
    email = CharField(unique=True)
    password = CharField()  # Dùng cho chức năng Login
    phone = CharField(null=True)
    title = CharField(null=True)
    avatar = TextField(null=True)
    emailUpdates = BooleanField(default=True)

    # Dữ liệu đầu vào cho AI
    skills = TextField(null=True)
    experience = TextField(null=True)

    # Lưu trữ nội dung text thuần túy sau khi parse từ file PDF/Docx
    cv_content = TextField(null=True)

    # Đường dẫn file CV (nếu bạn muốn cho tải về)
    cv_url = CharField(null=True)

    class Meta:
        table_name = 'job_seekers'