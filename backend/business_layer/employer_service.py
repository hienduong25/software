from data_layer.employer_repo import EmployerRepository
from business_layer.exceptions import NotFoundError, ValidationError

class EmployerService:
    def __init__(self):
        self.repo = EmployerRepository()

    def get_all_employers(self):
        return self.repo.get_all()

    def get_employer_by_id(self, employer_id):
        return self.repo.get_by_id(employer_id)

    def _sanitize_employer(self, employer):
        if not employer:
            return None
        return {key: value for key, value in employer.items() if key != "password"}

    def get_public_employer_by_id(self, employer_id):
        return self._sanitize_employer(self.get_employer_by_id(employer_id))

    def require_public_employer(self, employer_id):
        employer = self.get_public_employer_by_id(employer_id)
        if not employer:
            raise NotFoundError("Employer not found")
        return employer

    def prepare_profile_updates(self, data):
        updates = {
            key: value
            for key, value in data.items()
            if value is not None
        }
        if not updates:
            raise ValidationError("No profile fields to update")
        return updates

    def update_employer_profile(self, employer_id, updates):
        return self.repo.update(employer_id, updates)

    def update_public_employer_profile(self, employer_id, data):
        self.require_public_employer(employer_id)
        updates = self.prepare_profile_updates(data)
        updated = self.update_employer_profile(employer_id, updates)
        return self._sanitize_employer(updated)
