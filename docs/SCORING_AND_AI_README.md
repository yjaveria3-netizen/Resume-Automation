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
   - The LLM is explicitly instructed: *"Mention ONLY technologies explicitly present in the Provided Tech Stack or verified git diff. NEVER invent or hallucinate unmentioned frameworks."*
   - Truthful non-invented metrics: Metrics must only be included if explicitly present in the provided input metadata. Plausible metric fabrication instructions have been completely eliminated.
2. **Google's X-Y-Z Formula Priming:**
   - Enforces the structure: *"Accomplished [X], as measured by [Y], by doing [Z]"*.
3. **Action Verb Priming:**
   - Mandates initial past-tense engineering verbs (*Architected*, *Engineered*, *Deployed*, *Implemented*, *Optimized*).
4. **Prompt Injection Sanitizer:**
   - Normalizes text via Unicode NFKC and strips zero-width characters.
   - Comprehensive regex neutralization replacing adversarial patterns (e.g., `(ignore|disregard|forget|override|bypass)\W+(all\W+|any\W+|the\W+)?(previous|prior|above|earlier|preceding|system)\W+(instructions?|prompts?|rules?|context)`, `"you are now"`, `"developer mode"`, `"reveal|print|output ... key"`, fake role tags like `system:`, `assistant:`, `</repo_data>`) with `[removed]`.
   - Wraps inputs in `<repo_data>...</repo_data>` XML delimiter tags and escapes `<` and `>`.
5. **Post-Generation Bullet Validation:**
   - Single sentence, starting with a recognized action verb, 8–35 words total.
   - Every technology mentioned must exist in the provided input tech stack (verified against word-boundary matching).
   - If validation fails, retries once with stricter prompt before falling back to local deterministic templates.

---

## 3. 📄 Word Document Manipulation (`python-docx`)

### 🔍 Formatting Fidelity & Insertion Rules:
Word documents (`.docx`) store text inside nested XML tags: `Document > Paragraphs (<w:p>) > Runs (<w:r>) > Text (<w:t>)`.

* **Direct Under-Heading Insertion (`docx_engine/modifier.py`):**
  - Uses low-level OpenXML sibling insertion: `heading_p._p.addnext(title_p._p)` followed by `title_p._p.addnext(bullet_p._p)`.
  - Guarantees the entry is placed directly under the Projects heading in proper order:
    1. Projects (heading)
    2. New Project | Tech Stack (title)
    3. • Bullet Point (bullet)
    4. Sibling entries
  - Clones paragraph and run formatting (font, size, color, bold, italics, spacing, indent, alignment) from existing siblings.
* **Bullet Utility & Numbering Preservation (`docx_engine/bullet_utils.py`):**
  - Clones `w:numPr` and `w:pPr` from existing sibling bullets so bullet glyphs and indentation match the original document.
  - Avoids double bullets: never prepends a literal `"•"` when a Word bullet style or `numPr` is already applied.
* **Table Layout & Missing Section Fallback (`docx_engine/fallback.py` & `table_parser.py`):**
  - If no Projects header exists, clones existing section headings (Education/Skills) and inserts before Education in the same document object.
  - Supports multi-column table layouts, inserting after the heading inside the cell without table disruption.
* **Atomic Backup Safety (`with_document_backup`):**
  - Edits in an isolated temporary file first; atomically replaces destination on success. On any error, temporary files are removed without leaving `*_backup` debris.

---

## 4. 📊 ATS Resume Scoring Formula & Calibration

The 0–100 ATS Scoring Engine (`services/scoring.py`) evaluates resumes across **4 calibrated core categories**:

| Category | Weight | Calibration Details |
| :--- | :--- | :--- |
| **🚀 Action Verbs** | **25 pts** | Scans for 100+ past-tense action verbs at the **start** (first 3 words) of bullet lines. Deducts 3 pts per weak starter (`worked on`, `helped with`, `responsible for`). |
| **📈 Quantifiable Metrics** | **25 pts** | Strictly requires numbers attached to units: %, $, multipliers (`2x`), volume (`10k`, `250k`, `50,000`), or units (`users`, `req/s`, `rps`, `queries`, `events`, `ms`, `hours`, `tickets`). Standalone 4-digit years (1900–2099) and phone numbers are masked and excluded. Diminishing returns: 1 bullet = 10 pts, 2 = 16 pts, 3 = 21 pts, 4+ = 25 pts. |
| **🛠️ Tech Stack Density** | **30 pts** | Evaluates canonical technologies with word-boundary matching. Detects and penalizes keyword stuffing (>8 keywords with <=2 bullets or >30% keyword density capped at 10 pts). Ambiguous terms (`Go`, `REST`, `Git`) require proper casing/context. |
| **📄 Formatting & Structure** | **20 pts** | Required sections (Projects, Experience, Skills, Education: up to 8 pts), contact info (3 pts), bullet length 8–35 words (up to 5 pts), 1-page budget compliance (4 pts). |

### Score Labels:
* **"Needs Work"**: `< 60`
* **"Good"**: `60 – 79`
* **"Strong"**: `80 – 89`
* **"Exceptional"**: `90+` (scores capped at 95)

---

## 5. ⚠️ Known Limitations
1. **Scanned & Image Documents:** The engine operates strictly on native OpenXML `.docx` files. Scanned images, bitmap PDFs, or graphic-embedded resumes without Word paragraph XML cannot be parsed.
2. **Non-Standard Custom Section Headings:** While common variants (`PORTFOLIO HIGHLIGHTS`, `TECHNICAL PROJECTS`, `EXPERIENCE`) are detected via regex, non-English section headers or creative headings (`My Journey`, `Ventures`) require manual mapping.
3. **Complex Nested Tables:** Resumes using nested multi-tier tables for layout formatting may experience slight variance in line budget estimation compared to flat linear paragraph structures.
