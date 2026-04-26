import re

from data_layer.auth_repo import AuthRepository
from business_layer.exceptions import NotFoundError, UnauthorizedError, ValidationError


class AuthService:
    PASSWORD_REGEX = re.compile(r"^(?=.*[A-Z])(?=.*\d)\S{8,16}$")
    GMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@gmail\.com$")

    def __init__(self):
        self.repo = AuthRepository()

    def validate_password(self, password: str):
        if not self.PASSWORD_REGEX.fullmatch(password or ""):
            raise ValidationError(
                "Mật khẩu phải từ 8 đến 16 ký tự, có ít nhất 1 chữ cái viết hoa, 1 chữ số và không chứa khoảng trắng"
            )

    def validate_email(self, email: str):
        normalized_email = (email or "").strip().lower()
        if not self.GMAIL_REGEX.fullmatch(normalized_email):
            raise ValidationError("Email phải đúng định dạng và bắt buộc sử dụng đuôi @gmail.com")
        return normalized_email

    def register(self, data):
        normalized_email = self.validate_email(data.email)
        self.validate_password(data.password)

        if data.role == "employer":
            if not data.company_name:
                raise ValidationError("Tên công ty là bắt buộc cho nhà tuyển dụng")

            if self.repo.get_employer_by_email(normalized_email):
                raise ValidationError("Email này đã được sử dụng!")

            new_employer = self.repo.create_employer(
                email=normalized_email,
                password=data.password,
                company_name=data.company_name,
            )
            return {
                "status": "success",
                "message": "Đăng ký nhà tuyển dụng thành công!",
                "userId": new_employer.employerId,
            }

        if self.repo.get_seeker_by_email(normalized_email):
            raise ValidationError("Email này đã được sử dụng!")

        new_user = self.repo.create_seeker(
            full_name=data.full_name,
            email=normalized_email,
            password=data.password,
        )
        return {
            "status": "success",
            "message": "Đăng ký thành công!",
            "userId": new_user.jobSeekerId,
        }

    def login(self, data):
        normalized_email = (data.email or "").strip().lower()

        if data.role == "employer":
            employer = self.repo.get_employer_by_email(normalized_email)
            if not employer:
                raise NotFoundError("Email không tồn tại")
            if employer.password != data.password:
                raise UnauthorizedError("Mật khẩu không chính xác")

            return {
                "status": "success",
                "access_token": "fake-jwt-token-for-now",
                "user": {
                    "id": employer.employerId,
                    "email": employer.email,
                    "companyName": employer.companyName,
                    "title": employer.title,
                    "avatar": employer.avatar,
                    "role": "employer",
                },
            }

        user = self.repo.get_seeker_by_email(normalized_email)
        if not user:
            raise NotFoundError("Email không tồn tại")
        if user.password != data.password:
            raise UnauthorizedError("Mật khẩu không chính xác")

        return {
            "status": "success",
            "access_token": "fake-jwt-token-for-now",
            "user": {
                "id": user.jobSeekerId,
                "full_name": user.full_name,
                "email": user.email,
                "title": user.title,
                "avatar": user.avatar,
                "role": "seeker",
            },
        }
