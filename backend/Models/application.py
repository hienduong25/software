from peewee import AutoField, CharField, ForeignKeyField, IntegerField, DateTimeField, TextField
import datetime
from Models.base import BaseModel
from Models.job_seeker import JobSeeker
from Models.job import JobDescription

class Application(BaseModel):
    applicationId = AutoField(primary_key=True)
    
    # Quan hệ với bảng JobSeeker và JobDescription
    # on_delete='CASCADE': Khi xóa Job hoặc User, Application liên quan tự mất theo
    jobSeeker = ForeignKeyField(JobSeeker, backref='applications', column_name='jobSeekerId', on_delete='CASCADE')
    job = ForeignKeyField(JobDescription, backref='applications', column_name='jobId', on_delete='CASCADE')
    
    # Trạng thái: Pending, Accepted, Rejected
    status = CharField(default="Pending")
    
    # CỘT MỚI: Lưu điểm số AI (0-100)
    match_score = IntegerField(default=0)
    ai_summary = TextField(null=True)
    ai_recommendation = TextField(null=True)

    # Snapshot CV đã nộp để AI chấm lại đúng dữ liệu lúc ứng tuyển
    submitted_cv_name = CharField(null=True)
    submitted_full_name = CharField(null=True)
    submitted_email = CharField(null=True)
    submitted_phone = CharField(null=True)
    submitted_title = CharField(null=True)
    submitted_avatar = TextField(null=True)
    submitted_skills = TextField(null=True)
    submitted_experience = TextField(null=True)
    submitted_cv_content = TextField(null=True)
    submitted_cv_url = CharField(null=True)
    
    # CỘT MỚI: Ngày ứng tuyển (Lấy thời gian thực lúc tạo bản ghi)
    applied_at = DateTimeField(default=datetime.datetime.now)

    class Meta:
        table_name = 'applications'
