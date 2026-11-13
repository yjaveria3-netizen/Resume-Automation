import os
import sys
import uuid
import argparse
import docx
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

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
from app.models.github_account import GitHubAccount
from app.models.automation_log import AutomationLog


def reset_and_seed_demo_data(force: bool = False, db: Optional[object] = None) -> User:
    """Resets demo data for demo@resumeautoupdater.com and seeds a pristine state:
    1 user (demo@resumeautoupdater.com / DemoPassword123!),
    1 resume (.docx with 4 projects, 1-page baseline),
    1 pending suggestion with diff,
    1 JD (Senior Full-Stack Engineer, 85% match),
    4 baseline projects.

    Refuses to run when ENV=production unless force is True.
    Idempotent: running twice leaves the exact same clean state without duplicating rows.
    Only touches data for demo@resumeautoupdater.com.
    """
    env_name = (os.getenv("ENV") or getattr(settings, "ENV", "development") or "").strip().lower()
    if env_name == "production" and not force:
        raise RuntimeError("Refusing to reset demo data in production without --force")

    should_close = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        should_close = True

    try:
        demo_email = "demo@resumeautoupdater.com"

        # 1. Delete ONLY data associated with demo@resumeautoupdater.com
        demo_user = db.query(User).filter(User.email == demo_email).first()
        if demo_user:
            # Delete child records
            resumes = db.query(Resume).filter(Resume.user_id == demo_user.id).all()
            for r in resumes:
                db.query(ResumeVersion).filter(ResumeVersion.resume_id == r.id).delete()
                db.query(ArchivedProject).filter(ArchivedProject.resume_id == r.id).delete()
            db.query(Resume).filter(Resume.user_id == demo_user.id).delete()

            db.query(JobDescription).filter(JobDescription.user_id == demo_user.id).delete()
            db.query(BulletSuggestion).filter(BulletSuggestion.user_id == demo_user.id).delete()
            db.query(Project).filter(Project.user_id == demo_user.id).delete()
            db.query(GitHubAccount).filter(GitHubAccount.user_id == demo_user.id).delete()
            db.query(AutomationLog).filter(AutomationLog.user_id == demo_user.id).delete()
            db.delete(demo_user)
            db.commit()

        # 2. Seed pristine demo user
        demo_user = User(
            id=uuid.uuid4(),
            email=demo_email,
            password_hash=hash_password("DemoPassword123!"),
            role="user",
            created_at=datetime.now(timezone.utc),
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # 3. Create baseline .docx sample resume on disk
        storage_dir = Path(settings.STORAGE_DIR)
        storage_dir.mkdir(parents=True, exist_ok=True)
        demo_resume_path = storage_dir / "Software_Engineer_Resume.docx"

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

        doc.add_heading("Skills", 1)
        doc.add_paragraph("Python, Go, Java, Docker, Kubernetes, PostgreSQL, Redis, Kafka")

        doc.save(str(demo_resume_path))

        # 4. Seed Resume record
        demo_resume = Resume(
            id=uuid.uuid4(),
            user_id=demo_user.id,
            original_filename="Software_Engineer_Resume.docx",
            file_path=str(demo_resume_path.resolve()),
            ats_score=70,
            line_budget=20,
            uploaded_at=datetime.now(timezone.utc),
        )
        db.add(demo_resume)
        db.commit()
        db.refresh(demo_resume)

        # 5. Seed baseline ResumeVersion record (version_number 1, ats_score 70)
        demo_version = ResumeVersion(
            id=uuid.uuid4(),
            resume_id=demo_resume.id,
            file_path=str(demo_resume_path.resolve()),
            ats_score=70,
            version_number=1,
            created_at=datetime.now(timezone.utc),
        )
        db.add(demo_version)
        db.commit()

        # 6. Seed 4 baseline projects
        projects = [
            Project(
                id=uuid.uuid4(),
                user_id=demo_user.id,
                github_repo_name="e-commerce-microservices",
                description="High-throughput e-commerce microservices with Spring Boot and Kafka",
                tech_stack=["Java", "Spring Boot", "Kafka", "PostgreSQL", "Docker"],
                stars=38,
                forks_count=5,
                default_branch="main",
                rank_score=92.0,
            ),
            Project(
                id=uuid.uuid4(),
                user_id=demo_user.id,
                github_repo_name="distributed-task-runner",
                description="High-throughput asynchronous task queue with Redis broker in Go",
                tech_stack=["Go", "Redis", "Prometheus", "Docker", "gRPC"],
                stars=45,
                forks_count=8,
                default_branch="main",
                rank_score=94.5,
            ),
            Project(
                id=uuid.uuid4(),
                user_id=demo_user.id,
                github_repo_name="analytics-pipeline",
                description="Real-time streaming metric aggregation pipeline with FastAPI & ClickHouse",
                tech_stack=["Python", "FastAPI", "ClickHouse", "Docker"],
                stars=19,
                forks_count=2,
                default_branch="main",
                rank_score=87.0,
            ),
            Project(
                id=uuid.uuid4(),
                user_id=demo_user.id,
                github_repo_name="cloud-infra-automation",
                description="Automated multi-region cluster provisioning on AWS with Terraform & Kubernetes",
                tech_stack=["Terraform", "AWS", "Kubernetes", "Bash"],
                stars=29,
                forks_count=4,
                default_branch="main",
                rank_score=89.5,
            ),
        ]
        db.add_all(projects)
        db.commit()

        # 7. Seed 1 pending BulletSuggestion
        sugg = BulletSuggestion(
            id=uuid.uuid4(),
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

        # 8. Seed 1 target JobDescription ("Senior Full-Stack Engineer", 85% match)
        jd = JobDescription(
            id=uuid.uuid4(),
            user_id=demo_user.id,
            resume_id=demo_resume.id,
            title="Senior Full-Stack Engineer",
            jd_text="""We are seeking a Senior Full-Stack Engineer to design, scale, and optimize distributed cloud architectures.
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
        db.refresh(demo_user)
        user_email = demo_user.email
        return demo_user
    finally:
        if should_close:
            db.close()


def main():
    parser = argparse.ArgumentParser(description="Reset and seed demo data for Demo Day")
    parser.add_argument("--force", action="store_true", help="Force execution even in production environment")
    args = parser.parse_args()

    try:
        user = reset_and_seed_demo_data(force=args.force)
        print("Successfully reset and seeded demo data for demo@resumeautoupdater.com")
    except RuntimeError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
