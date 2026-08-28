"""
Mock Backend Server — Day 5 Testing
Yeh ek NAKLI (fake) server hai jo /regenerate-resume endpoint ka jawab deta hai,
taake Person C ka asal backend live hone se pehle bhi n8n workflow test ho sake.

Kaise chalayein:
1. Terminal mein is folder tak jayein
2. pip install fastapi uvicorn   (agar pehle install nahi hai)
3. uvicorn mock_server:app --reload --port 8000
4. Server chal jayega: http://localhost:8000
"""

from fastapi import FastAPI, Request
from datetime import datetime
import uuid

app = FastAPI()

# Yeh POST request ko sunta hai /regenerate-resume path pe
# n8n ka HTTP Request node isi address pe request bhejega (BACKEND_API_URL ki jagah
# http://localhost:8000 use karenge testing ke waqt)
@app.post("/regenerate-resume")
async def regenerate_resume(request: Request):
    # Jo data n8n ne bheja (user_id, repo_name, commit_message) usko receive karte hain
    body = await request.json()
    print("Mock backend ko yeh data mila:", body)

    # Nakli/fake success response banate hain — bilkul waisa jaisa PDF mein likha tha:
    # version_id, ats_score, updated_at
    fake_response = {
        "version_id": str(uuid.uuid4()),
        "ats_score": 82,
        "updated_at": datetime.utcnow().isoformat()
    }

    return fake_response
