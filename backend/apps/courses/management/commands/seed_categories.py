from django.core.management.base import BaseCommand
from apps.courses.models import CourseCategory


class Command(BaseCommand):
    help = "Create initial course categories"

    def handle(self, *args, **options):
        categories = [
            {"name": "Computer Science", "description": "Programming, algorithms, data structures, and software engineering"},
            {"name": "Mathematics", "description": "Algebra, calculus, statistics, and applied mathematics"},
            {"name": "Business", "description": "Management, marketing, finance, and entrepreneurship"},
            {"name": "Engineering", "description": "Mechanical, electrical, civil, and systems engineering"},
            {"name": "Arts & Humanities", "description": "Literature, history, philosophy, and creative arts"},
            {"name": "Science", "description": "Physics, chemistry, biology, and environmental science"},
            {"name": "Health & Medicine", "description": "Healthcare, medical studies, and wellness"},
            {"name": "Language Learning", "description": "Foreign languages and linguistics"},
        ]

        created_count = 0
        for cat_data in categories:
            _, created = CourseCategory.objects.get_or_create(
                name=cat_data["name"],
                defaults={"description": cat_data["description"]}
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created category: {cat_data['name']}"))
            else:
                self.stdout.write(f"Category already exists: {cat_data['name']}")

        self.stdout.write(self.style.SUCCESS(f"\nTotal created: {created_count} categories"))
