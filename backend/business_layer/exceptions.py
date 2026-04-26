class BusinessError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class NotFoundError(BusinessError):
    def __init__(self, message: str):
        super().__init__(message, status_code=404)


class ValidationError(BusinessError):
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class UnauthorizedError(BusinessError):
    def __init__(self, message: str):
        super().__init__(message, status_code=401)
