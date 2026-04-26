from peewee import AutoField, BooleanField, CharField, TextField
from Models.base import BaseModel

class Employer(BaseModel):
    employerId = AutoField(primary_key=True)
    email = CharField(unique=True)
    password = CharField()
    companyName = CharField()
    title = CharField(null=True)
    industry = CharField(null=True)
    address = CharField(null=True)
    description = TextField(null=True)
    avatar = TextField(null=True)
    emailUpdates = BooleanField(default=True)
    status = CharField(default="Active")

    class Meta:
        table_name = 'employers'
