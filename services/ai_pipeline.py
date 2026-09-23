import sys
from pathlib import Path

# Add project root and backend to python path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(ROOT_DIR / "backend") not in sys.path:
    sys.path.insert(0, str(ROOT_DIR / "backend"))

from docx_engine.unified_updater import update_resume_with_project
from services.scoring import compute_ats_score


def generate_and_update_resume(
    input_docx_path: str,
    output_docx_path: str,
    repo_data: dict,
    bullet_point: str = None,
) -> dict:
    """Combines AI Bullet Generation + .docx Engine Insertion + ATS Scoring into a single pipeline for backend integration."""
    project_title = repo_data.get("name", "Project")
    tech_stack = repo_data.get("tech_stack", [])

    # Use provided bullet point or fallback summary
    if not bullet_point:
        techs = ", ".join(tech_stack[:3]) if tech_stack else "modern tech stack"
        bullet_point = f"Engineered {project_title} using {techs} to automate core workflows and deliver reliable technical outcomes."

    # 1. Insert into .docx using Day 5 unified engine
    update_res = update_resume_with_project(
        input_docx_path=input_docx_path,
        output_docx_path=output_docx_path,
        project_title=project_title,
        tech_stack=tech_stack,
        bullet_point=bullet_point,
    )

    if not update_res.get("success"):
        return {
            "success": False,
            "error": update_res.get("error", "Failed to update resume document"),
            "output_path": None,
        }

    # 2. Compute updated ATS score using Day 6 scoring engine
    ats_res = compute_ats_score(output_docx_path)

    return {
        "success": True,
        "generated_bullet": bullet_point,
        "update_details": update_res,
        "ats_score": ats_res,
        "output_path": output_docx_path,
    }
