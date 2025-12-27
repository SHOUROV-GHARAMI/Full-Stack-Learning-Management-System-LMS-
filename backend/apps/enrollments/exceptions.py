

class EnrollmentValidationError(Exception):
    pass


class EnrollmentPermissionError(Exception):
    pass


class EnrollmentNotFoundError(Exception):
    pass


class AlreadyEnrolledError(EnrollmentValidationError):
    pass


class EnrollmentRequestNotFoundError(Exception):
    pass


class InvalidEnrollmentStatusError(EnrollmentValidationError):
    pass
