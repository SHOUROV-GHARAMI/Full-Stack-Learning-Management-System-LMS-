

class UserValidationError(Exception):
    pass


class PermissionDeniedError(Exception):
    pass


class AdminProtectionError(UserValidationError):
    pass


class RoleChangeError(UserValidationError):
    pass


class UserNotFoundError(Exception):
    pass
