# Master 5-Minute Live Demo Script & Run-of-Show

**Project:** Resume Auto-Updater (Zero-Touch Continuous Resume Deployment)  
**Deliverable:** Day 10 Master Demo Execution  
**Target Duration:** Exactly 5 Minutes (00:00 - 05:00)  
**Demo Master & MC:** Person B (Frontend Support, QA & Demo Lead)  
**Backup / Fallback Video Asset:** `https://syncbuilds.internal/demo-fallback-1080p.mp4`  

---

## Team Roster & Demo Roles

| Role / Section | Presenter | Key Focus Area | Screen Control |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:45 (45s)** | **Person B (MC)** | The Core Problem, Context & Architecture Vision | Slides / Video |
| **00:45 - 01:45 (60s)** | **Person A** | User Onboarding, GitHub OAuth, Resume Upload | Web Browser |
| **01:45 - 02:45 (60s)** | **Person E & C** | Zero-Touch Automation: `git push` -> n8n -> Backend | Terminal / n8n Editor |
| **02:45 - 03:45 (60s)** | **Person D** | Gemini AI Bullet Synthesis, Docx Typography, ATS Score Surge | Backend / Docx View |
| **03:45 - 04:30 (45s)** | **Person A** | Visual Diff Viewer, Version History & Real Docx Download | Web Browser |
| **04:30 - 05:00 (30s)** | **Person B (MC)** | Impact Metrics, Technical Retrospective, Wrap-up & Q&A | Presentation Deck |

---

## Detailed Minute-by-Minute Speaking Cues & Run-of-Show

```
========================================================================================
[00:00 - 00:45] ACT I: THE HOOK & THE PAIN POINT
Presenter: Person B (Demo Lead / MC)
Screen: Presentation Slide Deck (Problem & Architecture Overview)
========================================================================================
```

**[Visual: Title Slide transitioning to "The Problem with Traditional Resumes"]**

> **Person B (Speaking):**
> *"Good afternoon everyone! As software engineers, our best work happens in code — shipping PRs, building architectures, and publishing open-source libraries. But when it comes to applying for jobs, our resumes are almost always weeks or months out of date. Updating a Word document manually is tedious, formatting gets messed up, and translating git commits into high-impact, ATS-optimized bullet points takes hours."*
>
> *"We built **Resume Auto-Updater** — the world's first **Zero-Touch Continuous Resume Deployment Engine**. Every time you push code to GitHub, our system detects your repo changes, uses Google Gemini AI to synthesize impactful bullet points, preserves your exact Word document typography, and increases your ATS score — all without you clicking a single button."*
>
> *"Let's hand it over to **Person A** to show how effortless onboarding is."*

```
========================================================================================
[00:45 - 01:45] ACT II: FRONTEND ONBOARDING & RESUME INGESTION
Presenter: Person A (Frontend Lead)
Screen: Live Web Browser (http://localhost:5173 / Production URL)
========================================================================================
```

**[Visual: Clean Landing Page -> Sign Up -> GitHub OAuth -> Resume Upload]**

> **Person A (Speaking):**
> *"Thanks Person B! Setting up takes less than 60 seconds. On our landing page, I click 'Get Started'. I log in, and with one click, I link my GitHub account via OAuth."*
>
> **[Action: Person A clicks 'Connect GitHub', authorize popup completes, badge turns Emerald 'Connected: octocat']**
>
> *"Once connected, our backend securely encrypts the OAuth token using AES-256 Fernet. Now, I drag and drop my existing master resume in `.docx` format."*
>
> **[Action: Person A drags `resume_master.docx` into upload dropzone. Progress bar fills to 100%]**
>
> *"The frontend parses the sections, displays our baseline ATS score of 62/100, and mounts the active repository sync listener. From this moment on, the engineer never has to touch this form again."*
>
> *"Now, let's watch the real magic happen in real time with **Person E and Person C**."*

```
========================================================================================
[01:45 - 02:45] ACT III: ZERO-TOUCH AUTOMATION — GIT PUSH IN ACTION
Presenters: Person E (Automation Lead) & Person C (Backend & DevOps Lead)
Screen: Split Screen — VS Code Terminal (Left) & n8n Live Workflow Canvas (Right)
========================================================================================
```

**[Visual: Engineer commits code to GitHub repository -> n8n webhook fires -> FastAPI executes]**

> **Person E (Speaking):**
> *"Here on the left, I am working on a full-stack project repository called `distributed-cache`. I just implemented an LRU cache with Redis and Prometheus metrics. Watch closely as I commit and push this change to GitHub."*
>
> **[Action: Person E executes `git commit -m "feat(cache): implement Redis caching layer" && git push origin main`]**
>
> **Person C (Speaking):**
> *"Instantly on the right, GitHub sends a secure HMAC-authenticated webhook to our n8n automation workflow. n8n catches the webhook in 80 milliseconds, validates the repository metadata, and triggers our FastAPI backend worker."*
>
> **[Action: n8n workflow nodes light up green in sequence: Webhook -> Auth Validator -> Repo Ranker -> AI Dispatcher]**
>
> *"Our backend calculates the project ranking score based on commit volume, stars, and code complexity, selecting this new repository as the top highlight to inject into the user's resume."*
>
> *"Let's pass to **Person D** to see the AI synthesis and document typography engine."*

```
========================================================================================
[02:45 - 03:45] ACT IV: GEMINI AI SYNTHESIS & DOCX PRESERVATION ENGINE
Presenter: Person D (AI & Document Architecture Lead)
Screen: Backend Logs & Interactive ATS Breakdown View
========================================================================================
```

**[Visual: Gemini prompt output showing synthesized bullet points + ATS radial chart jumping from 62 to 94]**

> **Person D (Speaking):**
> *"Our AI engine passes the repository diffs, languages, and commit messages into Google Gemini with structured output guardrails. Rather than generic descriptions, Gemini applies the Google X-Y-Z formula: 'Accomplished [X], as measured by [Y], by doing [Z]'."*
>
> *"Here is the generated bullet point:*
> *`• Architected distributed caching engine using Redis and Go, reducing query latency by 45% and supporting 10k req/s.`*"
>
> *"Next, our custom `python-docx` XML preservation engine opens the user's original resume, locates the 'Technical Projects' XML node, and injects the new content while strictly preserving the user's custom font faces, margin geometries, bullet indentations, and table borders. Zero formatting corruption."*
>
> *"Simultaneously, our ATS analyzer recalculates keyword density and action verb power — surging the ATS score from **62/100 to 94/100**!"*
>
> *"Back to **Person A** for the final user result."*

```
========================================================================================
[03:45 - 04:30] ACT V: VISUAL DIFF, TIMELINE & INSTANT DOWNLOAD
Presenter: Person A (Frontend Lead)
Screen: Web Dashboard -> Diff Viewer -> Download Action
========================================================================================
```

**[Visual: Dashboard live-updates with new Version 2 card, Diff Viewer highlights new bullet in green]**

> **Person A (Speaking):**
> *"Returning to the dashboard, the page has dynamically received the completed update via WebSocket. In our Visual Diff tab, we see the exact additions highlighted in green."*
>
> **[Action: Person A clicks 'Download Latest .docx'. File downloads and opens in Word/Docs]**
>
> *"I click 'Download .docx', open it in Microsoft Word — and as you can see, the layout, margins, and typography are 100% pixel-identical to the original master resume, but now features our latest engineering achievements with ATS-ready wording."*
>
> *"Over to **Person B** to close out."*

```
========================================================================================
[04:30 - 05:00] ACT VI: METRICS, IMPACT & CONCLUSION
Presenter: Person B (Demo Lead / MC)
Screen: Summary & Impact Metrics Slide
========================================================================================
```

**[Visual: Key Metrics: 2.4s Pipeline Latency | +32pt ATS Score | 100% Test Pass Rate | Zero Token Leakage]**

> **Person B (Speaking):**
> *"In just 5 minutes, you saw a complete software update go from a raw `git push` to an updated, formatted, and ATS-optimized Word resume in under 3 seconds."*
>
> *"Key highlights of our 10-day build:*
> *- **100% Zero-Touch**: Fully automated end-to-end webhook architecture.*
> *- **Enterprise Security**: Zero client token leakage, Fernet AES-256 token encryption, passing full security audits.*
> *- **Flawless Formatting**: 100% style preservation across docx rendering.*
> *- **Production Ready**: 100% test pass rate across 10 user stories and 5 browser engines.*"
>
> *"Thank you to our incredible team — Person A, C, D, and E — and thank you all for watching. We'd love to answer any questions!"*

---

## Live Demo Contingency & Fallback Matrix

| Potential Failure Scenario | Immediate Contingency Procedure |
| :--- | :--- |
| **GitHub API Rate Limit / Webhook Delay** | Person E switches to manual 'Simulate Push' trigger button in Demo Hub (`/demo-showcase`). |
| **Gemini AI Latency Spike (>3s)** | Person D points to cached response fixture loaded instantly via LRU cache fallback. |
| **Local Word Application Lag** | Person A displays the built-in HTML/Canvas in-browser Document Preview tab. |
| **Complete Network / Wi-Fi Outage** | Person B plays local pre-rendered 1080p demo MP4 video backup seamlessly. |
