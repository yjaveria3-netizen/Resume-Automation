import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env or local .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_file = BASE_DIR / "backend" / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

# Also import our centralized gemini services
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "backend"))

from services.gemini_client import generate_bullets_with_retries, generate_local_fallback_bullets

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
IS_KEY_SET = bool(GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here")

# 5-10 Diverse Sample Repositories (Day 2 Step 1 & 2)
SAMPLE_REPOSITORIES = [
    {
        "name": "resume-auto-updater",
        "description": "AI-powered automated resume tailored to job descriptions",
        "readme_text": "Automates resume updates using Gemini LLM, FastAPI backend, and React frontend. Stores encrypted tokens and project metadata.",
        "primary_language": "Python",
        "tech_stack": ["FastAPI", "React", "PostgreSQL", "Docker", "TailwindCSS"],
        "repo_type": "Fullstack AI Application"
    },
    {
        "name": "distributed-task-runner",
        "description": "High-throughput asynchronous task queue with Redis broker",
        "readme_text": "Built in Go to process 10,000+ jobs/sec with exponential backoff retries, worker pooling, and real-time Prometheus monitoring.",
        "primary_language": "Go",
        "tech_stack": ["Go", "Redis", "Prometheus", "Docker", "gRPC"],
        "repo_type": "Distributed Systems Backend"
    },
    {
        "name": "chest-xray-classifier",
        "description": "PyTorch deep learning model for pneumonia detection",
        "readme_text": "Trained ResNet-50 CNN model on 50,000+ medical images achieving 94.2% validation accuracy with Grad-CAM visual explainability.",
        "primary_language": "Python",
        "tech_stack": ["PyTorch", "OpenCV", "NumPy", "Scikit-Learn"],
        "repo_type": "Machine Learning / Computer Vision"
    },
    {
        "name": "sparse-notes-app",
        "description": "Personal markdown notes app",
        "readme_text": "Simple local note taking app built over a weekend.",
        "primary_language": "TypeScript",
        "tech_stack": ["React", "TypeScript", "IndexedDB"],
        "repo_type": "Sparse README Hobby Project"
    },
    {
        "name": "ecommerce-microservices-engine",
        "description": "Event-driven microservices order processing backend",
        "readme_text": "Scalable e-commerce backend built with Spring Boot, Apache Kafka event streaming, and PostgreSQL database per service pattern.",
        "primary_language": "Java",
        "tech_stack": ["Java", "Spring Boot", "Apache Kafka", "PostgreSQL", "Kubernetes"],
        "repo_type": "Enterprise Backend Infrastructure"
    },
    {
        "name": "cli-vault-guard",
        "description": "Command-line AES-256 file encryption utility",
        "readme_text": "Zero-dependency Rust CLI tool for fast local file encryption with Argon2id password hashing.",
        "primary_language": "Rust",
        "tech_stack": ["Rust", "Argon2", "AES-256-GCM"],
        "repo_type": "CLI Security Tool"
    }
]


def generate_bullet_point(repo: dict) -> tuple[str, str]:
    """Generates a resume bullet point using Gemini client if configured, otherwise local fallback.
    Returns: (bullet_text, source_tag) where source_tag is '[gemini]' or '[fallback]'.
    """
    if not IS_KEY_SET:
        fb_bullet = generate_local_fallback_bullets(
            repo["name"],
            repo["tech_stack"],
            repo["description"]
        )[0]
        return fb_bullet, "[fallback]"

    res = generate_bullets_with_retries(
        repo_name=repo["name"],
        tech_stack=repo["tech_stack"],
        description=repo["description"],
        readme_text=repo.get("readme_text", "")
    )
    source_tag = f"[{res['source']}]"
    return res["bullet"], source_tag


def main():
    print("=================================================================================")
    print("   PERSON D: AI RESUME BULLET POINT GENERATOR & PROMPT TEST HARNESS (DAYS 1 & 2)")
    print("=================================================================================")
    if IS_KEY_SET:
        print("[INFO] GEMINI_API_KEY is configured. Real API calls will be executed.")
        status_line = "STATUS: GEMINI_API_KEY is configured. Live Gemini API calls executed."
    else:
        print("[NOTICE] GEMINI_API_KEY is unset or default. Running with truthful local fallback generator.")
        status_line = "STATUS: GEMINI_API_KEY is not configured. Running with truthful deterministic local fallback."

    results_lines = []
    results_lines.append(status_line)
    results_lines.append("=================================================================================\n")

    for idx, repo in enumerate(SAMPLE_REPOSITORIES, 1):
        print(f"[{idx}/{len(SAMPLE_REPOSITORIES)}] Repository: {repo['name']} ({repo['repo_type']})")
        print(f"  Tech Stack: {', '.join(repo['tech_stack'])}")

        bullet, source_tag = generate_bullet_point(repo)
        bullet_clean = bullet.lstrip("-*• ").strip()

        print(f"  Result Bullet: {source_tag} \"{bullet_clean}\"")
        print("-" * 85)

        results_lines.append(f"Repository: {repo['name']} ({repo['repo_type']})")
        results_lines.append(f"Tech Stack: {', '.join(repo['tech_stack'])}")
        results_lines.append(f"Generated Bullet: {source_tag} {bullet_clean}")
        results_lines.append("-" * 80 + "\n")

    output_dir = Path(__file__).resolve().parent
    output_file = output_dir / "results.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("=================================================================================\n")
        f.write("   PERSON D - GEMINI PROMPT TEST HARNESS RESULTS\n")
        f.write("=================================================================================\n")
        f.write("\n".join(results_lines))

    print(f"\n[SUCCESS] Test harness execution complete! Results saved to {output_file}")


if __name__ == "__main__":
    main()
