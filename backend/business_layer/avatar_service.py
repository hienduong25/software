from libs.upload import save_avatar_upload


class AvatarService:
    def build_absolute_upload_url(self, base_url: str, file_path: str) -> str:
        return f"{base_url.rstrip('/')}{file_path}"

    def upload_avatar(self, base_url: str, avatar) -> str:
        file_path = save_avatar_upload(avatar)
        return self.build_absolute_upload_url(base_url, file_path)
