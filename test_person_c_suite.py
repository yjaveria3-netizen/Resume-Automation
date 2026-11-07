import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.resume import Resume
from app.models.project import Project
from app.models.bullet_suggestion import BulletSuggestion
from app.models.archived_project import ArchivedProject
from app.models.job_description import JobDescription
from app.core.security import create_access_token

client = TestClient(app)

def run_tests():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@resumeautoupdater.com").first()
        assert user is not None, "Demo user not found"
        
        resume = db.query(Resume).filter(Resume.user_id == user.id).first()
        assert resume is not None, "Resume not found"

        project_to_archive = db.query(Project).filter(Project.user_id == user.id).first()
        assert project_to_archive is not None, "Project to archive not found"

        token = create_access_token(subject=str(user.id))
        headers = {"Authorization": f"Bearer {token}"}
        
        print("\n--- 1. Testing GET /suggestions (Pending list) ---")
        res = client.get("/suggestions?status=pending", headers=headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        suggestions = res.json()
        assert len(suggestions) >= 1, "Should have at least 1 pending suggestion"
        sugg = suggestions[0]
        sugg_id = sugg["id"]
        print(f"[PASS] Retrieved {len(suggestions)} suggestions. ID: {sugg_id}, Bullet: {sugg['proposed_bullet']}")

        print("\n--- 2. Testing PUT /suggestions/{id} (Edit proposed bullet) ---")
        new_text = "Updated bullet: Engineered high-throughput distributed cache in Go."
        res = client.put(f"/suggestions/{sugg_id}", json={"proposed_bullet": new_text}, headers=headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        assert res.json()["proposed_bullet"] == new_text
        print(f"[PASS] Successfully edited suggestion {sugg_id}")

        print("\n--- 3. Testing POST /suggestions/{id}/swap (Smart Swap project in docx) ---")
        swap_payload = {
            "archive_project_id": str(project_to_archive.id)
        }
        res = client.post(f"/suggestions/{sugg_id}/swap", json=swap_payload, headers=headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        swap_res = res.json()
        print(f"[PASS] Smart Swap successful. New version: v{swap_res['version_number']}, Download: {swap_res['download_url']}")

        # Verify archive record in DB
        archived = db.query(ArchivedProject).filter(ArchivedProject.user_id == user.id).first()
        assert archived is not None, "Archived project record should be created"
        print(f"[PASS] Archived project verified in DB: {archived.project_name}")

        print("\n--- 4. Testing POST /suggestions/{id}/accept (Accept suggestion into docx) ---")
        # Create a new temporary suggestion to test accept
        from datetime import datetime, timezone
        temp_sugg = BulletSuggestion(
            user_id=user.id,
            repo_name="realtime-streamer",
            proposed_bullet="Implemented WebSocket streaming pipeline handling 20,000 concurrent sockets.",
            diff_summary="+40 lines",
            status="pending",
            created_at=datetime.now(timezone.utc)
        )
        db.add(temp_sugg)
        db.commit()
        db.refresh(temp_sugg)

        res = client.post(f"/suggestions/{temp_sugg.id}/accept", json={"custom_bullet": "Implemented WebSocket streaming pipeline handling 20k sockets."}, headers=headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        print(f"[PASS] Accepted suggestion into resume version {res.json()['version_number']}")

        print("\n--- 5. Testing POST /suggestions/{id}/dismiss ---")
        temp_sugg2 = BulletSuggestion(
            user_id=user.id,
            repo_name="experimental-feature",
            proposed_bullet="Experimental bullet to dismiss.",
            diff_summary="+10 lines",
            status="pending",
            created_at=datetime.now(timezone.utc)
        )
        db.add(temp_sugg2)
        db.commit()
        db.refresh(temp_sugg2)

        res = client.post(f"/suggestions/{temp_sugg2.id}/dismiss", headers=headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        assert res.json()["status"] == "dismissed"
        print(f"[PASS] Dismissed suggestion {temp_sugg2.id}")

        print("\n--- 6. Testing POST /resumes/match-jd (JD Matching Engine) ---")
        jd_payload = {
            "resume_id": str(resume.id),
            "job_description": "Looking for a Senior Backend Engineer proficient in Python, FastAPI, Go, Docker, PostgreSQL, Kubernetes, Redis, and microservices architecture."
        }
        res = client.post("/resumes/match-jd", json=jd_payload, headers=headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        match_data = res.json()
        print(f"[PASS] Match score: {match_data['match_score']}%")
        print(f"       Matched: {match_data['matched_keywords']}")
        print(f"       Missing: {match_data['missing_keywords']}")

        print("\n--- 7. Testing GET /resumes/current (Budget metadata) ---")
        res = client.get("/resumes/current", headers=headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        cur_data = res.json()
        print(f"[PASS] Current resume metadata: estimated_line_count={cur_data.get('estimated_line_count')}, is_one_page_safe={cur_data.get('is_one_page_safe')}")

        print("\n=======================================================")
        print("   ALL PERSON C DAYS 11, 12, 13 TESTS PASSED!")
        print("=======================================================\n")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
