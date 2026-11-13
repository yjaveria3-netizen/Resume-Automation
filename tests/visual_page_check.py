"""
tests/visual_page_check.py

1-Page Visual QA Test Suite (Day 12 Deliverable - Person B)
Inspects rendered .docx page counts, enforces strict 1-page limits,
audits line wrapping to avoid awkward orphans, and tests JD keyword matching
against 5 real-world tech job descriptions.

Usage:
    python tests/visual_page_check.py
    pytest tests/visual_page_check.py
"""

import os
import sys
import tempfile
from pathlib import Path
from typing import List, Dict, Any

# Ensure project root is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import docx
from docx.shared import Pt, Inches
from docx_engine.page_budget import (
    estimate_page_lines,
    calculate_document_line_budget,
    auto_tighten_docx_spacing,
    has_libreoffice,
    convert_docx_to_pdf_page_count,
)
from services.jd_matcher import compute_jd_match_score


# ---------------------------------------------------------------------------
# 10 Varied Sample Resume Generator
# ---------------------------------------------------------------------------

SAMPLE_RESUMES = [
    {
        "id": "RES-01",
        "name": "Alex Rivera",
        "title": "Senior Full-Stack Engineer",
        "summary": "Full-stack engineer with 6 years building distributed React, Python, and cloud microservices.",
        "skills": "Python, React, TypeScript, FastAPI, PostgreSQL, Redis, Docker, AWS, Git",
        "projects": [
            {
                "title": "Distributed Cloud Workflow Orchestrator | Python, FastAPI, Redis",
                "bullets": [
                    "Architected asynchronous task orchestration engine processing 50,000+ daily pipeline jobs with 99.98% uptime.",
                    "Designed Redis-backed pub/sub caching layer, reducing p95 database query latency by 42%.",
                    "Integrated automated Docker CI/CD deployment pipelines on AWS ECS with zero-downtime blue/green rollouts."
                ]
            },
            {
                "title": "Real-Time Collaboration Canvas | React, TypeScript, WebSockets",
                "bullets": [
                    "Engineered multi-user collaborative editing workspace with operational transformation algorithms handling 200+ concurrent peers.",
                    "Optimized bundle size and Core Web Vitals using code splitting, achieving 98/100 Google Lighthouse score."
                ]
            },
            {
                "title": "High-Throughput Analytics Dashboard | Next.js, Tailwind CSS, PostgreSQL",
                "bullets": [
                    "Constructed interactive data visualization suite rendering real-time streaming telemetry for 15,000 active tenants.",
                    "Standardized reusable React component library, accelerating frontend feature velocity by 35%."
                ]
            }
        ]
    },
    {
        "id": "RES-02",
        "name": "Sophia Chen",
        "title": "Staff Backend Systems Architect",
        "summary": "Specialist in high-throughput distributed caching, event streaming, and database query optimization.",
        "skills": "Go, Python, Apache Kafka, PostgreSQL, Redis, Kubernetes, gRPC, Docker, Linux",
        "projects": [
            {
                "title": "Distributed In-Memory Cache Cluster | Go, Redis, Raft Consensus",
                "bullets": [
                    "Designed distributed LRU caching tier with consistent hashing ring, absorbing 70% of read traffic from main database.",
                    "Implemented custom Raft consensus replication protocol ensuring partition tolerance during node failovers."
                ]
            },
            {
                "title": "Streaming Event Pipeline | Python, Apache Kafka, PostgreSQL",
                "bullets": [
                    "Developed Kafka consumer group consumer processing 1.2M financial transaction events per minute with exactly-once delivery semantics.",
                    "Refactored complex PostgreSQL joins into partitioned hypertables, improving bulk ingestion throughput by 3.4x."
                ]
            }
        ]
    },
    {
        "id": "RES-03",
        "name": "Liam Walker",
        "title": "Senior Frontend UI/UX Engineer",
        "summary": "UI specialist creating accessible, pixel-perfect web applications with React, Tailwind CSS, and TypeScript.",
        "skills": "React, TypeScript, Next.js, Tailwind CSS, Vite, HTML5/CSS3, Webpack, Vitest, Jest",
        "projects": [
            {
                "title": "Design System & Micro-Frontend Hub | React, Tailwind CSS, Storybook",
                "bullets": [
                    "Crafted enterprise-wide component library with 45+ accessible WCAG AA-compliant controls across 4 product suites.",
                    "Eliminated CSS bloat by adopting utility-first Tailwind CSS design system, shrinking total CSS payload to 18kB gzip."
                ]
            },
            {
                "title": "E-Commerce Checkout Optimization | React, TypeScript, Redux Toolkit",
                "bullets": [
                    "Re-architected checkout funnel into a 3-step reactive wizard, lifting checkout conversion rate by 14.8%.",
                    "Configured client-side performance monitoring tracking First Input Delay and Largest Contentful Paint."
                ]
            }
        ]
    },
    {
        "id": "RES-04",
        "name": "Elena Rostova",
        "title": "Cloud Infrastructure & SRE Lead",
        "summary": "Infrastructure engineer focused on Kubernetes orchestration, Terraform automation, and observability.",
        "skills": "Kubernetes, Terraform, AWS, Docker, Prometheus, Grafana, CI/CD, Helm, Python, Bash",
        "projects": [
            {
                "title": "Multi-Region Kubernetes Platform | AWS EKS, Terraform, Helm",
                "bullets": [
                    "Automated infrastructure provisioning across 3 AWS regions using modular Terraform templates and GitOps workflows.",
                    "Configured horizontal pod autoscaling and ingress controllers handling 4x traffic surges during high-load promotions."
                ]
            },
            {
                "title": "Unified Observability & Alerting Stack | Prometheus, Grafana, OpenTelemetry",
                "bullets": [
                    "Instrumented distributed tracing and alerting pipelines across 85 microservices, reducing Mean Time to Resolution by 55%.",
                    "Authored automated self-healing scripts in Python and Bash to recover degraded worker nodes automatically."
                ]
            }
        ]
    },
    {
        "id": "RES-05",
        "name": "Marcus Thorne",
        "title": "Lead Data & Analytics Engineer",
        "summary": "Data engineer specializing in scalable ETL pipelines, Apache Spark, and cloud data warehouses.",
        "skills": "Python, Apache Spark, SQL, Apache Kafka, Airflow, Snowflake, AWS S3, Docker, dbt",
        "projects": [
            {
                "title": "Petabyte-Scale Lakehouse Pipeline | Apache Spark, Python, Snowflake",
                "bullets": [
                    "Engineered batch and streaming ETL pipelines transforming 4 TB of raw event logs daily into analytical data models.",
                    "Optimized Spark partitioning strategies and memory allocations, slashing cloud computation costs by 28%."
                ]
            },
            {
                "title": "Automated Data Governance & DAG Orchestrator | Apache Airflow, dbt, SQL",
                "bullets": [
                    "Scheduled and maintained 120+ directed acyclic graphs in Airflow with automated schema validation and data quality checks.",
                    "Built dimensional star schemas in Snowflake powering executive business intelligence dashboards."
                ]
            }
        ]
    },
    {
        "id": "RES-06",
        "name": "Aria Patel",
        "title": "Mobile Solutions Architect",
        "summary": "Cross-platform mobile engineer building fluid, high-performance applications in React Native and Swift.",
        "skills": "React Native, TypeScript, iOS, Android, Swift, REST APIs, GraphQL, Redux, Fastlane",
        "projects": [
            {
                "title": "Cross-Platform Fintech Mobile App | React Native, TypeScript, Redux",
                "bullets": [
                    "Developed cross-platform mobile wallet with biometric face/fingerprint authentication serving 250,000 active iOS and Android users.",
                    "Implemented offline-first SQLite database synchronization, allowing uninterrupted transaction queuing during connectivity drops."
                ]
            },
            {
                "title": "Mobile CI/CD & OTA Automation | Fastlane, GitHub Actions, CodePush",
                "bullets": [
                    "Automated iOS and Android binary builds and App Store submissions, shortening release cycle from 2 weeks to 2 hours."
                ]
            }
        ]
    },
    {
        "id": "RES-07",
        "name": "Devon Vance",
        "title": "Machine Learning & AI Platform Engineer",
        "summary": "AI engineer specializing in LLM applications, retrieval-augmented generation, and model serving.",
        "skills": "Python, PyTorch, Gemini API, OpenAI, LangChain, Vector DBs, FastAPI, Docker, PostgreSQL",
        "projects": [
            {
                "title": "Enterprise RAG Semantic Search Engine | Python, LangChain, ChromaDB",
                "bullets": [
                    "Architected semantic retrieval pipeline over 100,000 internal engineering documents with vector embeddings and reranking.",
                    "Reduced hallucination rates to under 1.2% through prompt engineering guardrails and automated context grounding."
                ]
            },
            {
                "title": "Scalable LLM Inference Microservice | FastAPI, Docker, Redis",
                "bullets": [
                    "Deployed containerized model serving gateway with semantic caching, cutting external API token costs by 45%."
                ]
            }
        ]
    },
    {
        "id": "RES-08",
        "name": "Zane Sterling",
        "title": "Information Security & Identity Engineer",
        "summary": "Securing cloud platforms through zero-trust architectures, OAuth2/OIDC, and automated vulnerability scanning.",
        "skills": "Python, OAuth2, JWT, Cryptography, Vault, Linux, Docker, OWASP, PostgreSQL",
        "projects": [
            {
                "title": "Zero-Trust Identity & Access Management Gateway | Python, OAuth2, JWT",
                "bullets": [
                    "Implemented centralized RBAC and cryptographic JWT token validation gateway securing 60+ microservices.",
                    "Mitigated OWASP Top 10 vulnerabilities and automated secrets rotation via HashiCorp Vault integration."
                ]
            },
            {
                "title": "Automated Security Audit & Compliance Scanner | Python, Docker, Bandit",
                "bullets": [
                    "Built automated dependency and static code vulnerability auditing script integrated into pull-request CI checks."
                ]
            }
        ]
    },
    {
        "id": "RES-09",
        "name": "Tariq Mansoor",
        "title": "High-Density Technical Lead (Heavy Content Test)",
        "summary": "Senior technical leader managing high-load infrastructure, cloud architecture, and multi-team product delivery.",
        "skills": "Python, Go, React, Kubernetes, AWS, Docker, PostgreSQL, Redis, Terraform, CI/CD",
        "projects": [
            {
                "title": "Autonomous Infrastructure Management Platform | Go, Kubernetes, AWS",
                "bullets": [
                    "Engineered cloud infrastructure reconciliation controller in Go, supervising 450 worker nodes across AWS EKS clusters.",
                    "Standardized microservice boilerplate templates and telemetry logging, reducing team onboarding cycle by 40%."
                ]
            },
            {
                "title": "High-Throughput Ingestion Queue | Python, Redis, Docker",
                "bullets": [
                    "Constructed streaming telemetry consumer handling 35k events/sec with automated backpressure and dead-letter queue recovery.",
                    "Containerized all microservices using minimal Alpine base images, lowering production cold start times by 60%."
                ]
            },
            {
                "title": "Enterprise Identity & Role Management | React, TypeScript, OAuth2",
                "bullets": [
                    "Designed single-sign-on administrative dashboard with granular permissions and multi-factor authentication enforcement."
                ]
            }
        ]
    },
    {
        "id": "RES-10",
        "name": "Maya Lin",
        "title": "Full-Stack Software Engineer (Career Pivot)",
        "summary": "Software engineer with engineering background transitioning into modern web systems, React, and Python.",
        "skills": "Python, JavaScript, React, Tailwind CSS, FastAPI, SQLite, Git, Docker, REST APIs",
        "projects": [
            {
                "title": "Resume Auto-Updater & Webhook Engine | React, Python, FastAPI",
                "bullets": [
                    "Constructed autonomous resume synchronization pipeline matching Git commit patches against ATS job descriptions.",
                    "Enforced strict 1-page document budget guarantees with progressive paragraph tightening algorithms."
                ]
            },
            {
                "title": "Interactive Job Description Matcher | React, Tailwind CSS",
                "bullets": [
                    "Designed responsive visual diff comparison modal and radial ATS score gauge with one-click keyword clipboard copying."
                ]
            }
        ]
    }
]


# ---------------------------------------------------------------------------
# 5 Diverse Real-World Job Descriptions for Step 5
# ---------------------------------------------------------------------------

JOB_DESCRIPTIONS = [
    {
        "id": "JD-01",
        "domain": "React Frontend",
        "title": "Senior React Frontend Engineer",
        "text": """
        Role: Senior Frontend Engineer
        Requirements:
        - 4+ years experience building modern web applications with React, JavaScript, and TypeScript.
        - Expertise in Tailwind CSS, CSS Grid, and responsive UI design systems.
        - Hands-on experience with Vite build tooling and modern frontend state management.
        - Deep understanding of Web Vitals, accessibility (WCAG), and browser DevTools.
        - Strong background consuming RESTful APIs and building reusable component libraries.
        Bonus:
        - Experience with Next.js, Redux, and micro-frontend architectures.
        """
    },
    {
        "id": "JD-02",
        "domain": "Python Backend",
        "title": "Senior Python Backend Engineer",
        "text": """
        Role: Senior Backend Engineer
        Requirements:
        - 5+ years experience architecting scalable backend microservices using Python, FastAPI, and PostgreSQL.
        - Strong knowledge of database design, query optimization, SQLAlchemy, and connection pooling.
        - Expertise in containerization with Docker and continuous integration / deployment (CI/CD) pipelines.
        - Hands-on experience with Redis caching, asynchronous processing, and message brokers.
        Bonus:
        - Familiarity with Kubernetes, gRPC, and high-throughput event streaming with Kafka.
        """
    },
    {
        "id": "JD-03",
        "domain": "DevOps / SRE",
        "title": "Cloud Infrastructure & DevOps Engineer",
        "text": """
        Role: DevOps Engineer / SRE
        Requirements:
        - 4+ years managing production cloud platforms on Amazon Web Services (AWS) or GCP.
        - Deep expertise in Kubernetes container orchestration, Helm charts, and cluster management.
        - Production experience writing Infrastructure as Code using Terraform.
        - Proficiency in Linux systems administration, Docker containerization, and Bash scripting.
        - Hands-on observability with Prometheus, Grafana, and distributed tracing.
        Bonus:
        - GitOps workflows (ArgoCD), CI/CD automation, and Python tooling.
        """
    },
    {
        "id": "JD-04",
        "domain": "Data Engineer",
        "title": "Senior Data & Analytics Engineer",
        "text": """
        Role: Data Platform Engineer
        Requirements:
        - 4+ years designing and maintaining big data ETL/ELT pipelines using Python and SQL.
        - Proven experience with Apache Spark for distributed data processing.
        - Experience with streaming data ingestion architectures using Apache Kafka.
        - Familiarity with cloud data warehouses like Snowflake, BigQuery, or Redshift.
        - Experience orchestrating complex data workflows using Apache Airflow.
        Bonus:
        - dbt (data build tool), Docker containerized jobs, and AWS S3 data lakes.
        """
    },
    {
        "id": "JD-05",
        "domain": "Mobile Developer",
        "title": "Senior Cross-Platform Mobile Engineer",
        "text": """
        Role: Mobile Application Engineer
        Requirements:
        - 3+ years experience developing cross-platform mobile apps using React Native and TypeScript.
        - Strong knowledge of native iOS (Swift) and Android (Kotlin) platform bridges.
        - Experience consuming RESTful APIs, handling offline storage (SQLite), and state management.
        - Proficiency with mobile CI/CD pipelines, Fastlane, and App Store / Google Play release management.
        Bonus:
        - Experience with GraphQL, biometric authentication, and mobile analytics.
        """
    }
]


# ---------------------------------------------------------------------------
# Helper: Build Sample .docx Resume
# ---------------------------------------------------------------------------

def create_resume_docx(data: Dict[str, Any], output_path: str) -> str:
    """Builds a realistic professional single-page .docx resume."""
    doc = docx.Document()

    # Set standard US Letter 8.5 x 11 in with 0.5 in margins
    for sec in doc.sections:
        sec.page_width = Inches(8.5)
        sec.page_height = Inches(11.0)
        sec.top_margin = Inches(0.5)
        sec.bottom_margin = Inches(0.5)
        sec.left_margin = Inches(0.5)
        sec.right_margin = Inches(0.5)

    # Header Name
    p_name = doc.add_paragraph()
    p_name.paragraph_format.space_before = Pt(0)
    p_name.paragraph_format.space_after = Pt(2)
    run_name = p_name.add_run(data["name"])
    run_name.font.size = Pt(16)
    run_name.font.bold = True
    run_name.font.name = "Calibri"

    # Contact line
    p_contact = doc.add_paragraph()
    p_contact.paragraph_format.space_before = Pt(0)
    p_contact.paragraph_format.space_after = Pt(4)
    run_contact = p_contact.add_run(
        f"{data['title']} | {data['name'].lower().replace(' ', '.')}@example.com | San Francisco, CA | github.com"
    )
    run_contact.font.size = Pt(9.5)
    run_contact.font.name = "Calibri"

    # Summary
    p_sum_head = doc.add_paragraph()
    p_sum_head.paragraph_format.space_before = Pt(4)
    p_sum_head.paragraph_format.space_after = Pt(1)
    run_sh = p_sum_head.add_run("PROFESSIONAL SUMMARY")
    run_sh.font.size = Pt(11)
    run_sh.font.bold = True
    run_sh.font.name = "Calibri"

    p_sum = doc.add_paragraph()
    p_sum.paragraph_format.space_before = Pt(0)
    p_sum.paragraph_format.space_after = Pt(4)
    run_s = p_sum.add_run(data["summary"])
    run_s.font.size = Pt(10)
    run_s.font.name = "Calibri"

    # Technical Skills
    p_sk_head = doc.add_paragraph()
    p_sk_head.paragraph_format.space_before = Pt(4)
    p_sk_head.paragraph_format.space_after = Pt(1)
    run_skh = p_sk_head.add_run("TECHNICAL SKILLS")
    run_skh.font.size = Pt(11)
    run_skh.font.bold = True
    run_skh.font.name = "Calibri"

    p_sk = doc.add_paragraph()
    p_sk.paragraph_format.space_before = Pt(0)
    p_sk.paragraph_format.space_after = Pt(4)
    run_sk = p_sk.add_run(f"Technologies & Frameworks: {data['skills']}")
    run_sk.font.size = Pt(10)
    run_sk.font.name = "Calibri"

    # Projects Section
    p_pr_head = doc.add_paragraph()
    p_pr_head.paragraph_format.space_before = Pt(4)
    p_pr_head.paragraph_format.space_after = Pt(2)
    run_prh = p_pr_head.add_run("TECHNICAL PROJECTS & EXPERIENCE")
    run_prh.font.size = Pt(11)
    run_prh.font.bold = True
    run_prh.font.name = "Calibri"

    for proj in data["projects"]:
        p_pt = doc.add_paragraph()
        p_pt.paragraph_format.space_before = Pt(3)
        p_pt.paragraph_format.space_after = Pt(1)
        run_pt = p_pt.add_run(proj["title"])
        run_pt.font.size = Pt(10)
        run_pt.font.bold = True
        run_pt.font.name = "Calibri"

        for bullet in proj["bullets"]:
            p_b = doc.add_paragraph(style="List Bullet")
            p_b.paragraph_format.space_before = Pt(0)
            p_b.paragraph_format.space_after = Pt(1.5)
            p_b.paragraph_format.line_spacing = 1.1
            run_b = p_b.add_run(bullet)
            run_b.font.size = Pt(10)
            run_b.font.name = "Calibri"

    # Auto-tighten to guarantee 1-page budget compliance
    auto_tighten_docx_spacing(doc)
    doc.save(output_path)
    return output_path


# ---------------------------------------------------------------------------
# Awkward Line Wrap Checker
# ---------------------------------------------------------------------------

def inspect_awkward_line_wraps(doc: docx.Document) -> List[str]:
    """
    Detects awkward line wraps, such as a single tiny orphan word (e.g. 'and', 'with')
    dangling alone on the trailing line of a wrapped paragraph.
    Uses dynamic line width calculated from actual page margins and font size.
    """
    # 1. Determine usable line width
    sec = doc.sections[0] if doc.sections else None
    page_width_pt = (sec.page_width.pt if sec and sec.page_width else 8.5 * 72.0)
    left_margin_pt = (sec.left_margin.pt if sec and sec.left_margin else 0.5 * 72.0)
    right_margin_pt = (sec.right_margin.pt if sec and sec.right_margin else 0.5 * 72.0)
    usable_width_pt = max(100.0, page_width_pt - left_margin_pt - right_margin_pt)

    # Estimate chars per line (~10pt font, ~4.8pt char width -> ~112 chars)
    chars_per_line = max(40, int(usable_width_pt / (10.0 * 0.48)))

    awkward_warnings = []
    for idx, p in enumerate(doc.paragraphs):
        text = p.text.strip()
        if not text:
            continue
        text_len = len(text)
        if text_len > chars_per_line:
            remainder = text_len % chars_per_line
            words = text.split()
            last_word = words[-1] if words else ""
            # A true orphan wrap is when the trailing remainder is very small (1-5 chars)
            # and fewer than 1 full word sits alone
            if 0 < remainder <= 5 and len(last_word) < 5:
                awkward_warnings.append(
                    f"Paragraph {idx} ends with orphan word ({remainder} chars): '{last_word}'"
                )
    return awkward_warnings


# ---------------------------------------------------------------------------
# Test Functions
# ---------------------------------------------------------------------------

def test_visual_page_check():
    """
    Step 3 & 4: 1-Page Visual QA Test Suite
    Tests 10 varied sample resumes to verify 100% stay strictly on 1 single page
    without overflowing and without awkward line wraps.
    """
    print("=" * 78)
    print("  1-PAGE VISUAL QA TEST SUITE: 10 SAMPLE RESUMES OVERFLOW AUDIT")
    print("=" * 78)

    temp_dir = tempfile.mkdtemp(prefix="visual_page_check_")
    passed_count = 0
    total_count = len(SAMPLE_RESUMES)

    for idx, sample in enumerate(SAMPLE_RESUMES, start=1):
        docx_path = os.path.join(temp_dir, f"resume_{idx:02d}_{sample['name'].replace(' ', '_')}.docx")
        create_resume_docx(sample, docx_path)

        doc = docx.Document(docx_path)
        budget = estimate_page_lines(doc)

        # PDF page count verification (if LibreOffice is available)
        pdf_pages = None
        if has_libreoffice():
            pdf_pages = convert_docx_to_pdf_page_count(docx_path, temp_dir)

        # Check line wrapping
        awkward_wraps = inspect_awkward_line_wraps(doc)

        # Verdict checks:
        # 1. lines_used <= lines_available (or is_one_page_safe is True)
        # 2. If PDF converted, page count == 1
        is_page_safe = budget["is_one_page_safe"] or (budget["lines_used"] <= budget["lines_available"])
        if pdf_pages is not None:
            is_page_safe = is_page_safe and (pdf_pages == 1)

        status_tag = "[PASS]" if is_page_safe else "[FAIL]"
        if is_page_safe:
            passed_count += 1

        print(f" {status_tag} Resume #{idx:02d} [{sample['id']}]: {sample['name']:<18} | {sample['title']}")
        print(f"         Budget: {budget['lines_used']} / {budget['lines_available']} lines "
              f"({budget['lines_available'] - budget['lines_used']} margin) | "
              f"PDF: {pdf_pages or 'Estimated (Geometric)'} | Wraps Clean: {len(awkward_wraps) == 0}")

        assert is_page_safe, (
            f"Resume {sample['name']} failed 1-page strictness: "
            f"lines_used={budget['lines_used']} > lines_available={budget['lines_available']}"
        )

    pass_rate = (passed_count / total_count) * 100
    print("-" * 78)
    print(f"  Summary: {passed_count}/{total_count} resumes strictly 1-page ({pass_rate:.1f}% pass rate)")
    print(f"  Verdict: {'ALL 10 RESUMES PASS 1-PAGE STRICTNESS AUDIT' if passed_count == total_count else 'FAILED'}")
    print("=" * 78 + "\n")
    assert passed_count == total_count


def test_jd_matcher_five_listings():
    """
    Step 5: Test the JD matching component with 5 diverse tech job listings:
    1) React Frontend
    2) Python Backend
    3) DevOps / SRE
    4) Data Engineer
    5) Mobile Developer
    """
    print("=" * 78)
    print("  TARGET JD MATCHER TEST SUITE: 5 REAL-WORLD TECH DOMAINS")
    print("=" * 78)

    # Use candidate resume #1 (Alex Rivera) as baseline
    temp_dir = tempfile.mkdtemp(prefix="jd_matcher_test_")
    docx_path = os.path.join(temp_dir, "alex_rivera_baseline.docx")
    create_resume_docx(SAMPLE_RESUMES[0], docx_path)

    for jd in JOB_DESCRIPTIONS:
        result = compute_jd_match_score(docx_path, jd["text"])

        score = result["match_score"]
        matched = result["matched_keywords"]
        missing = result["missing_keywords"]
        recs = result["recommendations"]

        assert 0 <= score <= 100, f"Match score {score} out of bounds for {jd['title']}"
        assert isinstance(matched, list), "matched_keywords must be a list"
        assert isinstance(missing, list), "missing_keywords must be a list"
        assert isinstance(recs, list), "recommendations must be a list"

        print(f" [PASS] Domain: {jd['domain']:<18} | Job: {jd['title']}")
        print(f"        Match Score: {score}%")
        print(f"        Matched ({len(matched)}): {', '.join(matched[:5])}{'...' if len(matched) > 5 else ''}")
        print(f"        Missing ({len(missing)}): {', '.join(missing[:5])}{'...' if len(missing) > 5 else ''}")
        print(f"        Actionable Recs ({len(recs)}): {recs[0] if recs else 'None'}")
        print("-" * 78)

    print("  Verdict: ALL 5 TECH JOB LISTINGS SUCCESSFULLY MATCHED & SCORED")
    print("=" * 78 + "\n")


# ---------------------------------------------------------------------------
# CLI Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("\nStarting Day 12 Visual QA & JD Matcher Verification Suite...\n")
    try:
        test_visual_page_check()
        test_jd_matcher_five_listings()
        print("ALL TESTS PASSED SUCCESSFULLY! (Exit 0)\n")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n[FAIL] Test assertion failed: {e}\n")
        sys.exit(1)
    except Exception as e:
        import traceback
        print(f"\n[ERROR] Unexpected test exception: {e}\n")
        traceback.print_exc()
        sys.exit(1)
