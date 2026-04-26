from Models.employer import Employer
from Models.job_seeker import JobSeeker


class AuthRepository:
    def get_employer_by_email(self, email):
        return Employer.get_or_none(Employer.email == email)

    def get_seeker_by_email(self, email):
        return JobSeeker.get_or_none(JobSeeker.email == email)

    def create_employer(self, email, password, company_name):
        return Employer.create(
            email=email,
            password=password,
            companyName=company_name,
        )

    def create_seeker(self, full_name, email, password):
        return JobSeeker.create(
            full_name=full_name,
            email=email,
            password=password,
        )
