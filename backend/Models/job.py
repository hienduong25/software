from peewee import AutoField, CharField, TextField, IntegerField, ForeignKeyField, DateTimeField
import datetime
from Models.base import BaseModel
from Models.employer import Employer

class JobDescription(BaseModel):
    jobId = AutoField(primary_key=True)
    title = CharField()
    description = TextField(null=True)
    
    # Thêm trường này để AI làm căn cứ so sánh với CV
    requirements = TextField(null=True) 
    
    location = CharField(null=True)
    salary_range = CharField(null=True) # Thêm để hiển thị trên JobCard FE
    
    maxApplicants = IntegerField(default=10)
    currentApplicants = IntegerField(default=0)
    
    employer = ForeignKeyField(Employer, backref='jobs', column_name='employerId', on_delete='CASCADE')
    created_at = DateTimeField(default=datetime.datetime.now)

    class Meta:
        table_name = 'jobs'