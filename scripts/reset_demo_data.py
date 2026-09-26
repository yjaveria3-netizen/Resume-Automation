import os
import sys
import uuid
import docx
from pathlib import Path
from datetime import datetime, timezone

# Add project root and backend to python path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from app.core.config import settings
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.project import Project


def reset_and_seed_demo_data():
    """Resets demo database tables and seeds a pristine demo user (demo@resumeautoupdater.com / DemoPassword123!) with sample resume & projects."""
    print("=================================================================================")
    print("   RESETTING & SEEDING DEMO DATABASE FOR DEMO DAY PRESENTATION")
    print("=================================================================================")

    # Auto-create tables if missing
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Delete test users starting with test_user_ or person_c_
        old_test_users = (
            db.query(User)
            .filter((User.email.like("test_user_%")) | (User.email.like("person_c_%")))
            .all()
        )
        for u in old_test_users:
            db.delete(u)
        db.commit()
        print(f"[OK] Cleaned up {len(old_test_users)} test users.")

        # 2. Upsert pristine demo user
        demo_email = "demo@resumeautoupdater.com"
        demo_user = db.query(User).filter(User.email == demo_email).first()

        if not demo_user:
            demo_user = User(
                email=demo_email,
                password_hash=hash_password("DemoPassword123!"),
                created_at=datetime.now(timezone.utc),
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"[OK] Created pristine demo user: {demo_email}")
        else:
            print(f"[OK] Pristine demo user exists: {demo_email}")

        # 3. Create baseline .docx sample resume on disk if missing
        storage_dir = Path(settings.STORAGE_DIR)
        storage_dir.mkdir(parents=True, exist_ok=True)
        demo_resume_path = storage_dir / "Software_Engineer_Resume.docx"

        if not demo_resume_path.exists():
            doc = docx.Document()
            doc.add_heading("Demo User", 0)
            doc.add_paragraph("Email: demo@resumeautoupdater.com | Location: Remote")

            doc.add_heading("Projects", 1)
            p1 = doc.add_paragraph()
            p1.add_run("E-Commerce Microservices Engine | Java, Spring Boot, Kafka").bold = True
            doc.add_paragraph("Architected high-throughput order processing backend handling 5,000 requests/sec.", style="List Bullet")

            doc.add_heading("Experience", 1)
            doc.add_paragraph("Senior Backend Engineer | Tech Corp")
            doc.add_paragraph("Engineered distributed task runner in Go processing 10k jobs/sec.", style="List Bullet")

            doc.save(str(demo_resume_path))
            print(f"[OK] Generated baseline demo resume at: {demo_resume_path}")

        # 4. Upsert Resume record in DB
        existing_resume = (
            db.query(Resume)
            .filter(Resume.user_id == demo_user.id)
            .first()
        )

        if not existing_resume:
            existing_resume = Resume(
                user_id=demo_user.id,
                original_filename="Software_Engineer_Resume.docx",
                file_path=str(demo_resume_path.resolve()),
                uploaded_at=datetime.now(timezone.utc),
            )
            db.add(existing_resume)
            db.commit()
            db.refresh(existing_resume)
            print("[OK] Seeded baseline Resume database record.")

        # 5. Seed baseline ResumeVersion record (version_number 1, ats_score 70)
        existing_version = (
            db.query(ResumeVersion)
            .filter(ResumeVersion.resume_id == existing_resume.id)
            .first()
        )

        if not existing_version:
            existing_version = ResumeVersion(
                resume_id=existing_resume.id,
                file_path=str(demo_resume_path.resolve()),
                ats_score=70,
                version_number=1,
                created_at=datetime.now(timezone.utc),
            )
            db.add(existing_version)
            db.commit()
            print("[OK] Seeded baseline ResumeVersion #1 (ATS Score: 70).")

        # 6. Seed sample GitHub projects for demo user
        proj_count = db.query(Project).filter(Project.user_id == demo_user.id).count()
        if proj_count == 0:
            p1 = Project(
                user_id=demo_user.id,
                github_repo_name="resume-auto-updater",
                description="AI-powered resume auto-updater using FastAPI, React, and Gemini API",
                tech_stack=["FastAPI", "React", "PostgreSQL", "Google Gemini API", "Docker"],
                stars=25,
                rank_score=94.5,
            )
            p2 = Project(
                user_id=demo_user.id,
                github_repo_name="distributed-task-runner",
                description="High-throughput asynchronous task queue with Redis broker in Go",
                tech_stack=["Go", "Redis", "Prometheus", "Docker", "gRPC"],
                stars=42,
                rank_score=91.0,
            )
            db.add_all([p1, p2])
            db.commit()
            print("[OK] Seeded sample GitHub projects for demo user.")

        print("\n=================================================================================")
        print("   \033[92mDemo database successfully reset and seeded!\033[0m")
        print("   Demo User Email: demo@resumeautoupdater.com")
        print("   Demo Password:   DemoPassword123!")
        print("=================================================================================\n")

    finally:
        db.close()


if __name__ == "__main__":
    reset_and_seed_demo_data()
