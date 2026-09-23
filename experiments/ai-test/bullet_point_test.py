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

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Initialize Gemini SDK client if key is present
genai_client = None
genai_model = None

if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        from google import genai
        genai_client = genai.Client(api_key=GEMINI_API_KEY)
        print("[INFO] Initialized modern google-genai Client.")
    except Exception:
        try:
            import google.generativeai as genai_legacy
            genai_legacy.configure(api_key=GEMINI_API_KEY)
            genai_model = genai_legacy.GenerativeModel("gemini-1.5-flash")
            print("[INFO] Initialized legacy google.generativeai Model.")
        except Exception as e:
            print(f"[WARNING] Could not initialize Gemini SDK: {e}")

# 5-10 Diverse Sample Repositories (Day 2 Step 1 & 2)
SAMPLE_REPOSITORIES = [
    {
        "name": "resume-auto-updater",
        "description": "AI-powered automated resume tailored to job descriptions",
        "readme_text": "Automates resume updates using Gemini LLM, FastAPI backend, and React frontend. Stores encrypted tokens and project metadata.",
        "primary_language": "Python",
        "tech_stack": ["FastAPI", "React", "PostgreSQL", "Google Gemini API", "Docker", "TailwindCSS"],
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
        "tech_stack": ["PyTorch", "OpenCV", "NumPy", "Scikit-Learn", "Torchvision"],
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

# Structured Prompt Template (Day 2 Step 3)
PROMPT_TEMPLATE = """You are an expert technical resume writer. Your task is to write EXACTLY ONE professional resume bullet point based ONLY on the provided GitHub repository information.

STRICT FORMATTING RULES:
1. Start with one strong action verb (e.g., Engineered, Architected, Developed, Implemented, Designed, Built).
2. Mention ONLY technologies that are explicitly present in the Provided Tech Stack. NEVER invent or hallucinate unmentioned technologies or frameworks.
3. Keep the entire bullet point to a single sentence under 30 words total.
4. Never use vague filler phrases like "worked on", "helped with", "responsible for", "assisted in".
5. Include a clear, plausible technical impact or outcome (e.g., improving performance, automating processes, achieving high accuracy).

INPUT REPOSITORY DATA:
- Repository Name: {name}
- Description: {description}
- Primary Language: {primary_language}
- Provided Tech Stack: {tech_stack_str}
- README Summary: {readme_text}

GENERATE EXACTLY ONE RESUME BULLET POINT:"""


def build_prompt(repo: dict) -> str:
    """Formats the structured prompt template for a given repository."""
    tech_stack_str = ", ".join(repo.get("tech_stack", []))
    return PROMPT_TEMPLATE.format(
        name=repo.get("name", ""),
        description=repo.get("description", ""),
        primary_language=repo.get("primary_language", ""),
        tech_stack_str=tech_stack_str,
        readme_text=repo.get("readme_text", "")
    )


def generate_bullet_point(repo: dict) -> str:
    """Sends repository prompt to Gemini API and returns generated resume bullet point."""
    prompt = build_prompt(repo)

    # 1. If live Gemini API key is configured, call Gemini API
    if genai_client:
        for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"]:
            try:
                response = genai_client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                continue

    elif genai_model:
        try:
            response = genai_model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            pass

    # 2. Deterministic fallback if API key is invalid or offline
    techs = ", ".join(repo["tech_stack"][:3])
    return f"Engineered {repo['name']} using {techs} to automate core workflows and deliver reliable technical outcomes."


def main():
    print("=================================================================================")
    print("   PERSON D: AI RESUME BULLET POINT GENERATOR & PROMPT TEST HARNESS (DAYS 1 & 2)")
    print("=================================================================================")
    print(f"API Key Configured: {'YES' if (GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here') else 'NO (Running with fallback template generator)'}\n")

    results_lines = []

    for idx, repo in enumerate(SAMPLE_REPOSITORIES, 1):
        print(f"[{idx}/{len(SAMPLE_REPOSITORIES)}] Testing Repository: {repo['name']} ({repo['repo_type']})")
        print(f"  Tech Stack: {', '.join(repo['tech_stack'])}")
        
        bullet = generate_bullet_point(repo)
        
        # Clean up Markdown bullet characters if returned by model
        bullet_clean = bullet.lstrip("-*• ").strip()

        print(f"  Result Bullet Point: \"{bullet_clean}\"")
        print("-" * 85)

        results_lines.append(f"Repository: {repo['name']} ({repo['repo_type']})")
        results_lines.append(f"Tech Stack: {', '.join(repo['tech_stack'])}")
        results_lines.append(f"Generated Bullet: {bullet_clean}")
        results_lines.append("-" * 80 + "\n")

    # Save test harness output to experiments/ai-test/results.txt (Day 2 Quick Commands)
    output_dir = Path(__file__).resolve().parent
    output_file = output_dir / "results.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("=================================================================================\n")
        f.write("   PERSON D - GEMINI PROMPT TEST HARNESS RESULTS (DAY 1 & DAY 2)\n")
        f.write("=================================================================================\n\n")
        f.write("\n".join(results_lines))

    print(f"\n[SUCCESS] Test harness execution complete! Results saved to {output_file}")


if __name__ == "__main__":
    main()
