from data_layer.base_repository import BaseRepository
from Models import JobSeeker, Application

class JobSeekerRepository(BaseRepository):
    def get_all(self):
        query = (
            JobSeeker
            .select(JobSeeker)
            .join(Application)
            .distinct()
        )
        return list(query.dicts())

    def get_by_id(self, seeker_id):
        return JobSeeker.select().where(JobSeeker.jobSeekerId == seeker_id).dicts().first()

    def update(self, seeker_id, updates):
        JobSeeker.update(**updates).where(JobSeeker.jobSeekerId == seeker_id).execute()
        return self.get_by_id(seeker_id)