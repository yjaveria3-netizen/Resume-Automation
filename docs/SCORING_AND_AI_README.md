# Technical AI Prompt Engineering & ATS Resume Scoring Guide

## 1. 🤖 AI Architecture Overview
The AI Resume Auto-Updater pipeline processes GitHub repository metadata and commit activity to automatically synthesize high-impact, professional resume bullet points.

```text
GitHub Repos / Commits
         │
         ▼
[ Prompt Sanitization & Injection Guardrails ]
         │
         ▼
[ SHA-256 AI Bullet Cache Check ]
         ├── (Cache Hit) ──► Return Cached Bullets (<10ms)
         └── (Cache Miss) ─► [ Gemini 2.5/2.0 Flash API with Jitter Retries ]
                                  │
                                  ▼
                     [ Format & Tech Capitalization Normalizer ]
                                  │
                                  ▼
                    [ docx Engine Style-Preserving Insertion ]
                                  │
                                  ▼
                   [ 4-Part ATS Resume Scoring Engine ]
```

---

## 2. 🧠 Prompt Engineering Strategy

### 🎯 Key Design Principles:
1. **Strict Anti-Hallucination Constraints:**
   - The LLM is explicitly instructed: *"Mention ONLY technologies explicitly present in the Provided Tech Stack. NEVER invent or hallucinate unmentioned frameworks."*
2. **Google's X-Y-Z Formula Priming:**
   - Enforces the structure: *"Accomplished [X], as measured by [Y], by doing [Z]"*.
3. **Action Verb Priming:**
   - Mandates initial past-tense engineering verbs (*Architected*, *Engineered*, *Deployed*, *Implemented*, *Optimized*).
4. **Prompt Injection Guardrails:**
   - Strips non-printable control characters, truncates input text to 1,000 characters, neutralizes injection phrases (`"ignore previous instructions"`, `"system prompt"`), and wraps inputs in `<repo_data>...</repo_data>` XML delimiter tags.
5. **Boilerplate Prohibition:**
   - Strictly forbids weak passive phrasing like *"worked on"*, *"helped with"*, or *"leveraged modern best practices"*.

---

## 3. 📄 Word Document Manipulation (`python-docx`)

### 🔍 How Formatting Fidelity is Preserved:
Word documents (`.docx`) store text inside nested XML tags: `Document > Paragraphs (<w:p>) > Runs (<w:r>) > Text (<w:t>)`.

* **Style Cloning (`docx_engine/formatter.py`):**
  - Extract `font.name`, `font.size`, `font.bold`, `font.italic`, and `font.color.rgb` from existing runs.
  - Extract paragraph spacing (`space_before`, `space_after`), line spacing, indentation (`left_indent`), and style name (`List Bullet`).
* **Table Layout & Missing Section Fallback (`docx_engine/fallback.py` & `table_parser.py`):**
  - If no Projects header exists, dynamically creates a styled `"Projects"` section before `"Education"` or at document bottom.
  - Detects multi-column table layouts without breaking XML hierarchy.
* **Automatic Backup Safety (`with_document_backup`):**
  - Creates temporary document backups before editing and automatically rolls back if an error occurs.

---

## 4. 📊 ATS Resume Scoring Formula

The 0–100 ATS Scoring Engine (`services/scoring.py`) evaluates resumes across **4 core categories**:

| Category | Weight | Description |
| :--- | :--- | :--- |
| **🚀 Action Verbs** | **25%** (max 25 pts) | Scans for 100+ strong engineering verbs (*Architected*, *Engineered*, *Deployed*, *Optimized*). |
| **📈 Quantifiable Metrics** | **25%** (max 25 pts) | Regex search for numbers, percentages, multipliers (`"30%"`, `"$10k"`, `"2x"`, `"500+ users"`). |
| **🛠️ Tech Stack Density** | **30%** (max 30 pts) | Counts modern software keywords (`Python`, `React`, `Docker`, `PostgreSQL`, `FastAPI`, `AWS`). |
| **📄 Formatting & Structure** | **20%** (max 20 pts) | Validates section headers and balanced bullet lengths (15–35 words). |

---

## ⚡ 5. Performance & Cost Analysis

* **Token Consumption:** Average ~250 input tokens and ~35 output tokens per generation call (~0.0001 USD per bullet).
* **Caching Efficiency (`services/ai_cache.py`):** SHA-256 hashing of `repo_name + commit_sha + tech_stack` yields **<10ms response time** on cache hits and saves 100% of LLM API costs for duplicate commits.
* **Scoring Execution:** Pure Python regex and text analysis executes in **< 15ms** per document.
