from data_layer.job_seeker_repo import JobSeekerRepository
import re
from business_layer.exceptions import NotFoundError, ValidationError

class JobSeekerService:
    VIETNAM_PHONE_REGEX = re.compile(r"^0(?:2\d{8,9}|[35789]\d{8})$")

    def __init__(self):
        self.repo = JobSeekerRepository()

    def get_all_seekers(self):
        return self.repo.get_all()

    def get_seeker_by_id(self, seeker_id):
        return self.repo.get_by_id(seeker_id)

    def _sanitize_seeker(self, seeker):
        if not seeker:
            return None
        return {key: value for key, value in seeker.items() if key != "password"}

    def get_public_seekers(self):
        return [self._sanitize_seeker(seeker) for seeker in self.get_all_seekers()]

    def get_public_seeker_by_id(self, seeker_id):
        return self._sanitize_seeker(self.get_seeker_by_id(seeker_id))

    def require_public_seeker(self, seeker_id):
        seeker = self.get_public_seeker_by_id(seeker_id)
        if not seeker:
            raise NotFoundError("Seeker not found")
        return seeker

    def prepare_profile_updates(self, data):
        updates = {
            key: value
            for key, value in data.items()
            if value is not None
        }
        if not updates:
            raise ValidationError("No profile fields to update")
        return updates

    def normalize_phone(self, phone: str) -> str:
        return re.sub(r"\D", "", phone or "")

    def validate_vietnam_phone(self, phone: str):
        normalized_phone = self.normalize_phone(phone)
        if not self.VIETNAM_PHONE_REGEX.fullmatch(normalized_phone):
            raise ValidationError(
                "Số điện thoại phải đúng đầu số Việt Nam và có độ dài từ 10 đến 11 số"
            )
        return normalized_phone

    def update_seeker_profile(self, seeker_id, updates):
        if "phone" in updates and updates["phone"]:
            updates["phone"] = self.validate_vietnam_phone(updates["phone"])
        return self.repo.update(seeker_id, updates)

    def update_public_seeker_profile(self, seeker_id, data):
        self.require_public_seeker(seeker_id)
        updates = self.prepare_profile_updates(data)
        updated = self.update_seeker_profile(seeker_id, updates)
        return self._sanitize_seeker(updated)
