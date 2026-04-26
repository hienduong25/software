from data_layer.base_repository import BaseRepository
from Models import Employer

class EmployerRepository(BaseRepository):
    def get_all(self):
        return list(Employer.select().dicts())

    def get_by_id(self, emp_id):
        return Employer.select().where(Employer.employerId == emp_id).dicts().first()

    def update(self, emp_id, updates):
        Employer.update(**updates).where(Employer.employerId == emp_id).execute()
        return self.get_by_id(emp_id)