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
from app.models.bullet_suggestion import BulletSuggestion
from app.models.job_description import JobDescription
from app.models.archived_project import ArchivedProject


def reset_and_seed_demo_data():
    """Resets demo database tables and seeds a pristine demo user (demo@resumeautoupdater.com / DemoPassword123!)
    with sample resume, 4 projects, 1 pending suggestion, and 1 target job description."""
    print("=================================================================================")
    print("   RESETTING & SEEDING DEMO DATABASE FOR DEMO DAY PRESENTATION (v1.1)")
    print("=================================================================================")

    # Auto-create tables if missing
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Delete old test users starting with test_user_ or person_c_
        old_test_users = (
            db.query(User)
            .filter((User.email.like("test_user_%")) | (User.email.like("person_c_%")))
            .all()
        )
        for u in old_test_users:
            db.delete(u)
        db.commit()
        if old_test_users:
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

        # Ensure docx exists with 4 project sections
        doc = docx.Document()
        doc.add_heading("Demo User", 0)
        doc.add_paragraph("Email: demo@resumeautoupdater.com | Location: Remote | GitHub: github.com/demouser")

        doc.add_heading("Projects", 1)
        p1 = doc.add_paragraph()
        p1.add_run("E-Commerce Microservices Engine | Java, Spring Boot, Kafka").bold = True
        doc.add_paragraph("Architected high-throughput order processing backend handling 5,000 requests/sec.", style="List Bullet")

        p2 = doc.add_paragraph()
        p2.add_run("Distributed Task Runner | Go, Redis, Docker").bold = True
        doc.add_paragraph("Engineered distributed task queue processing 10k background jobs/sec.", style="List Bullet")

        p3 = doc.add_paragraph()
        p3.add_run("Real-Time Analytics Pipeline | Python, FastAPI, ClickHouse").bold = True
        doc.add_paragraph("Built streaming metric aggregation engine ingesting 50k events/second.", style="List Bullet")

        p4 = doc.add_paragraph()
        p4.add_run("Cloud Infrastructure Automation | Terraform, AWS, Kubernetes").bold = True
        doc.add_paragraph("Automated multi-region cluster provisioning reducing deployment times by 60%.", style="List Bullet")

        doc.add_heading("Experience", 1)
        doc.add_paragraph("Senior Backend Engineer | Tech Corp")
        doc.add_paragraph("Spearheaded core microservices scalability initiatives and database optimizations.", style="List Bullet")

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
        else:
            existing_resume.file_path = str(demo_resume_path.resolve())
            db.commit()

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

        # 6. Seed 4 sample GitHub projects for demo user
        db.query(Project).filter(Project.user_id == demo_user.id).delete()
        projects = [
            Project(
                user_id=demo_user.id,
                github_repo_name="e-commerce-microservices",
                description="High-throughput e-commerce microservices with Spring Boot and Kafka",
                tech_stack=["Java", "Spring Boot", "Kafka", "PostgreSQL", "Docker"],
                stars=38,
                rank_score=92.0,
            ),
            Project(
                user_id=demo_user.id,
                github_repo_name="distributed-task-runner",
                description="High-throughput asynchronous task queue with Redis broker in Go",
                tech_stack=["Go", "Redis", "Prometheus", "Docker", "gRPC"],
                stars=45,
                rank_score=94.5,
            ),
            Project(
                user_id=demo_user.id,
                github_repo_name="analytics-pipeline",
                description="Real-time streaming metric aggregation pipeline with FastAPI & ClickHouse",
                tech_stack=["Python", "FastAPI", "ClickHouse", "Docker"],
                stars=19,
                rank_score=87.0,
            ),
            Project(
                user_id=demo_user.id,
                github_repo_name="cloud-infra-automation",
                description="Automated multi-region cluster provisioning on AWS with Terraform & Kubernetes",
                tech_stack=["Terraform", "AWS", "Kubernetes", "Bash"],
                stars=29,
                rank_score=89.5,
            ),
        ]
        db.add_all(projects)
        db.commit()
        print(f"[OK] Seeded {len(projects)} sample projects for demo user.")

        # 7. Seed 1 pending BulletSuggestion record (Day 13 spec)
        db.query(BulletSuggestion).filter(BulletSuggestion.user_id == demo_user.id).delete()
        sugg = BulletSuggestion(
            user_id=demo_user.id,
            repo_name="distributed-cache",
            commit_sha="a7b3f9c8d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6",
            commit_message="Implement distributed LRU cache eviction and Redis tiering",
            diff_summary="+95 lines in cache.go, 2 files modified",
            proposed_bullet="Engineered distributed LRU cache in Go with Redis backend, reducing database query load by 45%",
            status="pending",
            created_at=datetime.now(timezone.utc),
        )
        db.add(sugg)
        db.commit()
        print("[OK] Seeded 1 pending BulletSuggestion ('distributed-cache').")

        # 8. Seed 1 target JobDescription record (Day 13 spec: "Senior Fullstack Engineer")
        db.query(JobDescription).filter(JobDescription.user_id == demo_user.id).delete()
        jd = JobDescription(
            user_id=demo_user.id,
            resume_id=existing_resume.id,
            title="Senior Fullstack Engineer",
            jd_text="""We are seeking a Senior Fullstack Engineer to design, scale, and optimize distributed cloud architectures.
Key requirements:
- 4+ years of professional experience building high-throughput microservices using Go, Python, or Java.
- Proven experience with distributed systems, caching strategies (Redis, Memcached), and message brokers (Kafka, RabbitMQ).
- Strong proficiency with PostgreSQL, relational database indexing, and query optimization.
- Hands-on expertise with Docker containerization, Kubernetes orchestration, and AWS cloud environments.
- Experience building RESTful APIs, gRPC services, and automated CI/CD deployment pipelines.""".strip(),
            match_score=85,
            matched_keywords=["Go", "Python", "Java", "Redis", "Kafka", "PostgreSQL", "Docker", "Kubernetes", "AWS", "gRPC"],
            missing_keywords=["Memcached", "RabbitMQ"],
            created_at=datetime.now(timezone.utc),
        )
        db.add(jd)
        db.commit()
        print("[OK] Seeded 1 target JobDescription ('Senior Fullstack Engineer').")

        print("\n=================================================================================")
        print("   \033[92mDemo database successfully reset and seeded!\033[0m")
        print("   Demo User Email: demo@resumeautoupdater.com")
        print("   Demo Password:   DemoPassword123!")
        print("   Pending Bullet Suggestions: 1")
        print("   Target Job Descriptions:    1")
        print("   Baseline Projects:          4")
        print("=================================================================================\n")

    finally:
        db.close()


if __name__ == "__main__":
    reset_and_seed_demo_data()
