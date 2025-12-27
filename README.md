# 🎓 Full Stack Learning Management System (LMS)

A modern Learning Management System built with Django REST Framework and React, featuring role-based access control, course management, and student enrollment workflows.

## 📋 Project Overview

This LMS platform provides a comprehensive solution for educational institutions to manage courses, instructors, and students. The system implements a hierarchical role-based architecture with three user types: Admins, Instructors, and Students.

## ✨ Features

- JWT-based authentication with token refresh and blacklisting
- Role-based access control (Admin, Instructor, Student)
- User management with unique registration numbers
- Course creation and management with categories
- Student enrollment system with instructor approval
- Instructor can enroll/unenroll students by email
- Re-enrollment support after cancellation
- Role-specific dashboards with analytics
- Password reset functionality
- Responsive UI with gradient design

## 🛠️ Tech Stack

**Backend:**
- Django 5.1.2
- Django REST Framework 3.15.2
- djangorestframework-simplejwt 5.4.0
- SQLite (dev) / PostgreSQL (production)
- Python 3.13+

**Frontend:**
- React 18.3.1
- Vite 5.4.10
- React Router 6.27.0
- Axios 1.7.7

## 🚀 Setup Instructions

### Backend

1. Clone and navigate to project:
```bash
git clone <repository-url>
cd FULL_STACK_LMS_PROJECT/backend
```

2. Create virtual environment and install dependencies:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

3. Run migrations and create superuser:
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

1. Navigate to frontend directory and install dependencies:
```bash
cd frontend
npm install
npm run dev
```

**Access Application:**
- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:8000
- Admin Panel: http://127.0.0.1:8000/admin
# Full-Stack-Learning-Management-System-LMS-
