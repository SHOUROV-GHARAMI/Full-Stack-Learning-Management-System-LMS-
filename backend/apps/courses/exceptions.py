

class CourseValidationError(Exception):
    pass


class CoursePermissionError(Exception):
    pass


class CourseNotFoundError(Exception):
    pass


class CategoryNotFoundError(Exception):
    pass


class InstructorRequiredError(CoursePermissionError):
    pass
