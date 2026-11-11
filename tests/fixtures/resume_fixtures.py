import docx
from pathlib import Path


def create_weak_resume_1(path: Path):
    doc = docx.Document()
    doc.add_heading("John Doe", 0)
    doc.add_paragraph("Summary")
    doc.add_paragraph("Worked on software tasks. Helped with various coding bugs and assisted team in meetings.")
    doc.add_paragraph("Responsible for daily standups.")
    doc.save(str(path))


def create_weak_resume_2(path: Path):
    doc = docx.Document()
    doc.add_paragraph("Jane Smith")
    doc.add_paragraph("Was involved in website development and helped to maintain old programs.")
    doc.add_paragraph("Assisted in general IT support.")
    doc.save(str(path))


def create_weak_resume_3(path: Path):
    doc = docx.Document()
    doc.add_paragraph("Developer Resume")
    doc.add_paragraph("Participated in backend work. Worked on bug fixing without specific technologies.")
    doc.save(str(path))


def create_average_resume_1(path: Path):
    doc = docx.Document()
    doc.add_heading("Candidate Average 1", 0)
    doc.add_paragraph("Email: dev1@example.com | Phone: 555-123-4567")
    doc.add_heading("Skills", 1)
    doc.add_paragraph("Python, JavaScript, SQL, HTML, CSS, Git")
    doc.add_heading("Experience", 1)
    doc.add_paragraph("Software Developer | Alpha Inc")
    doc.add_paragraph("Developed internal reporting tools using Python and SQL for 45 active users.", style="List Bullet")
    doc.add_paragraph("Built responsive user interfaces with JavaScript and CSS for business dashboards.", style="List Bullet")
    doc.add_paragraph("Collaborated with QA engineers to resolve defects prior to deployment cycles.", style="List Bullet")
    doc.add_heading("Education", 1)
    doc.add_paragraph("B.S. Computer Science, 2021")
    doc.save(str(path))


def create_average_resume_2(path: Path):
    doc = docx.Document()
    doc.add_heading("Candidate Average 2", 0)
    doc.add_paragraph("Email: dev2@example.com | github.com/dev2")
    doc.add_heading("Skills", 1)
    doc.add_paragraph("React, Node.js, PostgreSQL, TypeScript, Docker")
    doc.add_heading("Projects", 1)
    doc.add_paragraph("E-Commerce Portal | React, Node.js")
    doc.add_paragraph("Engineered e-commerce checkout interface using React and Node.js for client web application.", style="List Bullet")
    doc.add_paragraph("Configured PostgreSQL database schemas and REST API endpoints for customer profiles.", style="List Bullet")
    doc.add_heading("Experience", 1)
    doc.add_paragraph("Junior Web Developer | Beta Corp")
    doc.add_paragraph("Maintained web services and resolved over 25 Jira defect tickets during quarterly releases.", style="List Bullet")
    doc.add_heading("Education", 1)
    doc.add_paragraph("B.S. Software Engineering")
    doc.save(str(path))


def create_average_resume_3(path: Path):
    doc = docx.Document()
    doc.add_heading("Candidate Average 3", 0)
    doc.add_paragraph("Email: dev3@example.com")
    doc.add_heading("Skills", 1)
    doc.add_paragraph("Java, Spring Boot, MySQL, Docker, Linux")
    doc.add_heading("Projects", 1)
    doc.add_paragraph("Inventory Tracker | Java, MySQL")
    doc.add_paragraph("Designed inventory tracking microservice with Spring Boot and MySQL for warehouse cataloging.", style="List Bullet")
    doc.add_paragraph("Containerized application using Docker, decreasing local setup configuration time by 20%.", style="List Bullet")
    doc.add_heading("Experience", 1)
    doc.add_paragraph("Associate Developer | Gamma LLC")
    doc.add_paragraph("Implemented RESTful endpoints for inventory data queries across internal engineering teams.", style="List Bullet")
    doc.add_heading("Education", 1)
    doc.add_paragraph("State College, 2020")
    doc.save(str(path))


def create_strong_resume_1(path: Path):
    doc = docx.Document()
    doc.add_heading("Elite Fullstack Engineer", 0)
    doc.add_paragraph("Email: elite1@example.com | github.com/elite1 | linkedin.com/in/elite1")
    doc.add_heading("Skills", 1)
    doc.add_paragraph("Python, FastAPI, PostgreSQL, Redis, Docker, Kubernetes, AWS, Go, React, TypeScript, GraphQL, CI/CD")
    doc.add_heading("Projects", 1)
    doc.add_paragraph("High-Throughput Order Engine | FastAPI, Redis, PostgreSQL")
    doc.add_paragraph("Architected distributed order streaming microservice handling 45,000 requests/sec, reducing API latency by 40%.", style="List Bullet")
    doc.add_paragraph("Engineered in-memory Redis cache cluster cutting PostgreSQL query load by 55% across 250k daily users.", style="List Bullet")
    doc.add_heading("Experience", 1)
    doc.add_paragraph("Senior Backend Engineer | CloudScale Systems")
    doc.add_paragraph("Spearheaded multi-region Kubernetes migration on AWS, decreasing cloud infrastructure costs by $85k annually.", style="List Bullet")
    doc.add_paragraph("Optimized automated CI/CD deployment pipelines with Docker, accelerating release cycle velocity by 3x.", style="List Bullet")
    doc.add_heading("Education", 1)
    doc.add_paragraph("B.S. in Computer Science & Engineering, Top Honors")
    doc.save(str(path))


def create_strong_resume_2(path: Path):
    doc = docx.Document()
    doc.add_heading("Staff Infrastructure Engineer", 0)
    doc.add_paragraph("Email: elite2@example.com | github.com/elite2")
    doc.add_heading("Skills", 1)
    doc.add_paragraph("Go, Kubernetes, Terraform, AWS, Docker, Kafka, PostgreSQL, Prometheus, gRPC")
    doc.add_heading("Projects", 1)
    doc.add_paragraph("Distributed Event Bus | Go, Kafka, Kubernetes")
    doc.add_paragraph("Engineered distributed event streaming pipeline in Go ingesting 50,000 events/sec with 99.99% availability.", style="List Bullet")
    doc.add_paragraph("Implemented Kafka message partitioning and consumer offset groups, improving data processing throughput by 65%.", style="List Bullet")
    doc.add_heading("Experience", 1)
    doc.add_paragraph("Principal Platform Engineer | Enterprise Corp")
    doc.add_paragraph("Automated immutable multi-cluster infrastructure deployments using Terraform, saving 120 engineering hours monthly.", style="List Bullet")
    doc.add_paragraph("Orchestrated microservices monitoring with Prometheus and Grafana, reducing mean-time-to-resolution by 50%.", style="List Bullet")
    doc.add_heading("Education", 1)
    doc.add_paragraph("M.S. in Distributed Systems")
    doc.save(str(path))


def create_strong_resume_3(path: Path):
    doc = docx.Document()
    doc.add_heading("Lead ML & Backend Architect", 0)
    doc.add_paragraph("Email: elite3@example.com | linkedin.com/in/elite3")
    doc.add_heading("Skills", 1)
    doc.add_paragraph("Python, PyTorch, FastAPI, Docker, Kubernetes, AWS, PostgreSQL, Redis, ClickHouse")
    doc.add_heading("Projects", 1)
    doc.add_paragraph("Real-Time Inference Server | Python, PyTorch, FastAPI")
    doc.add_paragraph("Architected high-scale deep learning model inference engine serving 15,000 queries/sec with sub-25ms latency.", style="List Bullet")
    doc.add_paragraph("Optimized model quantization and GPU kernel execution, slashing compute resource utilization by 45%.", style="List Bullet")
    doc.add_heading("Experience", 1)
    doc.add_paragraph("Senior AI Platform Engineer | Tech Innovators")
    doc.add_paragraph("Deployed scalable vector search services in Kubernetes, accelerating similarity query speeds by 4x for 100k+ active users.", style="List Bullet")
    doc.add_paragraph("Constructed real-time analytical event pipelines in ClickHouse, reducing batch aggregation processing times by 70%.", style="List Bullet")
    doc.add_heading("Education", 1)
    doc.add_paragraph("B.S. in Computer Science")
    doc.save(str(path))


def create_keyword_stuffed_resume(path: Path):
    doc = docx.Document()
    doc.add_paragraph("Python Python Python Java Java React React React Docker Docker Kubernetes Kubernetes AWS AWS PostgreSQL PostgreSQL Redis Redis GraphQL")
    doc.save(str(path))


def create_numbers_only_resume(path: Path):
    doc = docx.Document()
    doc.add_paragraph("Resume")
    doc.add_paragraph("1998 1999 2000 2005 2010 2020 2022 2023 2024")
    doc.add_paragraph("Call 555-123-4567 or 800-555-0199 or 312-555-7890")
    doc.save(str(path))
