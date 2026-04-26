from peewee import Model
from libs.database import db

class BaseModel(Model):
    class Meta:
        database = db