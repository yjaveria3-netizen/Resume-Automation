import os
import sys
import argparse
import tempfile
from pathlib import Path
import docx

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from services.scoring import compute_ats_score
from docx_engine.unified_updater import update_resume_with_project
from docx_engine.page_budget import calculate_document_line_budget


def create_default_samples(sample_dir: Path):
    """Creates initial sample resumes if directory is empty."""
    sample_dir.mkdir(parents=True, exist_ok=True)
    roles = [
        ("frontend_dev.docx", "Frontend Developer", ["React", "TypeScript", "HTML", "CSS"], "Projects"),
        ("backend_dev.docx", "Backend Engineer", ["Python", "FastAPI", "PostgreSQL"], "Experience"),
        ("devops_eng.docx", "DevOps Engineer", ["Docker", "Kubernetes", "AWS"], "Skills"),
        ("data_eng.docx", "Data Engineer", ["Python", "SQL", "Spark"], "Projects"),
        ("qa_eng.docx", "QA Automation Engineer", ["Python", "Selenium", "Docker"], "Experience"),
    ]
    for filename, title, skills, sec in roles:
        p = sample_dir / filename
        if not p.exists():
            doc = docx.Document()
            doc.add_heading(title, 0)
            doc.add_paragraph("candidate@example.com | 555-0199")
            doc.add_heading("Skills", 1)
            doc.add_paragraph(", ".join(skills))
            doc.add_heading(sec, 1)
            doc.add_paragraph(f"Developed core systems utilizing {skills[0]} and {skills[1]}.", style="List Bullet")
            doc.save(str(p))


def run_resumes_evaluation(resumes_dir: str):
    dir_path = Path(resumes_dir)
    if not dir_path.exists() or not list(dir_path.glob("*.docx")):
        print(f"[INFO] Directory '{resumes_dir}' is empty or does not exist. Generating default sample resumes...")
        create_default_samples(dir_path)

    resume_files = sorted(list(dir_path.glob("*.docx")))
    print("=" * 85)
    print(f"   RESUME EVALUATION SUITE: Processing {len(resume_files)} resumes from {dir_path.resolve()}")
    print("=" * 85)

    headers = ["File", "Initial", "Final", "Delta", "1-Page Safe", "Status"]
    col_widths = [28, 9, 7, 7, 13, 9]
    header_line = " | ".join(h.ljust(w) for h, w in zip(headers, col_widths))
    sep_line = "-+-".join("-" * w for w in col_widths)

    print(header_line)
    print(sep_line)

    results = []

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)

        for docx_file in resume_files:
            fname = docx_file.name
            out_file = tmp_path / f"updated_{fname}"

            try:
                # 1. Initial ATS score
                initial_res = compute_ats_score(str(docx_file))
                initial_score = initial_res["score"]

                # 2. Update with standardized candidate project
                update_res = update_resume_with_project(
                    input_docx_path=str(docx_file),
                    output_docx_path=str(out_file),
                    project_title="Distributed Task Queue",
                    tech_stack=["Go", "Redis", "Docker"],
                    bullet_point="Engineered high-throughput asynchronous task processing pipeline in Go handling 10,000 tasks/sec."
                )

                # 3. Final ATS score & 1-page budget check
                final_res = compute_ats_score(str(out_file))
                final_score = final_res["score"]
                delta = final_score - initial_score
                delta_str = f"+{delta}" if delta >= 0 else str(delta)

                out_doc = docx.Document(str(out_file))
                budget = calculate_document_line_budget(out_doc)
                one_page_safe = "YES" if budget["is_one_page_safe"] else "NO"
                status = "SUCCESS" if update_res.get("success") else "FAILED"

            except Exception as e:
                initial_score = 0
                final_score = 0
                delta_str = "N/A"
                one_page_safe = "ERR"
                status = "ERROR"

            row = [
                (fname[:25] + "...") if len(fname) > 28 else fname,
                str(initial_score),
                str(final_score),
                delta_str,
                one_page_safe,
                status
            ]
            row_line = " | ".join(val.ljust(w) for val, w in zip(row, col_widths))
            print(row_line)

            results.append({
                "file": fname,
                "initial": initial_score,
                "final": final_score,
                "delta": delta_str,
                "one_page_safe": one_page_safe,
                "status": status
            })

    print(sep_line)
    successful = sum(1 for r in results if r["status"] == "SUCCESS")
    print(f"Summary: {successful}/{len(results)} resumes updated successfully.\n")


def main():
    parser = argparse.ArgumentParser(description="Evaluate resume ATS scores and document updates.")
    parser.add_argument(
        "--resumes-dir",
        type=str,
        default=str(Path(__file__).parent / "samples"),
        help="Directory containing input .docx resumes to test"
    )
    args = parser.parse_args()
    run_resumes_evaluation(args.resumes_dir)


if __name__ == "__main__":
    main()
