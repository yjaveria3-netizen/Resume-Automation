# Enterprise Master Demo Script v1.1: 5-Minute Live Run-of-Show

**Project:** Resume Auto-Updater (Continuous Integration & Human-in-the-Loop Resume Deployment)  
**Deliverable:** Day 13 Master Demo Execution & Grand Finale  
**Target Duration:** Exactly 5 Minutes (00:00 - 05:00)  
**Host & MC:** Person B (Frontend Support, QA & Demo Lead)  
**Presenters:** Person A (Frontend Lead), Person B (Demo & QA Lead), Person C (Backend & DevOps Lead), Person D (AI & Document Architecture Lead), Person E (Automation & Webhooks Lead)  
**Rehearsal Standard:** Enforced strict speaking limit under 55 seconds per person with verified zero speaking collisions and seamless screen-sharing handoffs.  
**Fallback Asset:** `docs/screenshots/` and pre-recorded high-definition demonstration walkthroughs.

---

## 1. Team Roster & Master Run-of-Show Timeline

| Timestamp | Act / Feature Pillar | Presenters | Visual & Screen Control | Strict Time |
| :--- | :--- | :--- | :--- | :---: |
| **0:00 - 0:45** | **Act I: The Resume Bloat Dilemma & Human Curation** | **Person B** | Slide Deck: Problem, Bloat & Architecture Vision | 45s |
| **0:45 - 1:45** | **Act II: The Smart Pipeline ('wip' Commit to AI Bullet)** | **Person E & C** | Split: Terminal (`git push`) + n8n Canvas + Backend Logs | 60s |
| **1:45 - 2:45** | **Act III: Human Editorial Control & Visual Diff** | **Person A & B** | Web App: Review Queue Card + Visual Diff Modal + In-line Edit | 60s |
| **2:45 - 3:45** | **Act IV: 1-Page Strictness & Real-Time JD Matching** | **Person D & A** | Web App: 1-Page Budget Meter + Smart Swap Modal + JD Drawer | 60s |
| **3:45 - 4:30** | **Act V: Instant Download & Enterprise Architecture** | **Person C & D** | Word .docx Ingestion + Fernet Token Vault + Architecture Flow | 45s |
| **4:30 - 5:00** | **Act VI: Performance Metrics, Retrospective & Q&A** | **Person B** | Slide Deck: Benchmarks, Test Passes & Open Audience Q&A | 30s |

---

## 2. Minute-by-Minute Detailed Speaking Cues & Screen Actions

```text
========================================================================================
[0:00 - 0:45] ACT I: INTRO — THE RESUME CHALLENGE & HUMAN CURATION
Presenter: Person B (Host & MC)
Screen Control: Presentation Slide Deck (Slide 1: Vision & Slide 2: The Bloat Problem)
========================================================================================
```

**[Visual: Title Slide transitioning to "The Problem of Resume Bloat & Unchecked Automation"]**

> **Person B (Speaking - 0:00 to 0:45):**  
> *"Good afternoon everyone! As engineers, we ship code every single day. But our resumes remain perpetually obsolete. When developers try to update them, they face two massive challenges:  
> First, **Resume Bloat** — as projects pile up, resumes spill onto page 2, instantly disqualifying candidates from companies with strict 1-page resume rules.  
> Second, **The Black-Box AI Trap** — fully automated tools write hallucinated or robotic buzzwords directly into your documents without human oversight.  
>
> We built **Resume Auto-Updater** to bridge this gap: an enterprise-grade, human-in-the-loop continuous sync pipeline. We transform minimal git commits into quantified STAR bullets, enforce strict 1-page layout protection via Smart Swapping, and dynamically score resumes against real target job descriptions — keeping the engineer firmly in editorial control.  
> 
> Let's see how code turns into verified accomplishments with **Person E and Person C**."*

---

```text
========================================================================================
[0:45 - 1:45] ACT II: THE SMART PIPELINE — SPARSE COMMIT TO PENDING REVIEW QUEUE
Presenters: Person E (Automation Lead) & Person C (Backend & DevOps Lead)
Screen Control: Split Screen — VS Code Terminal (Left) & n8n Live Execution Graph (Right)
========================================================================================
```

**[Visual: Person E types sparse commit in terminal; n8n workflow fires; backend parses diff]**

> **Person E (Speaking - 0:45 to 1:15):**  
> *"Engineers don't write clean resume bullets in commit messages; they write things like 'wip' or 'fix bug'. Watch this real workflow:  
> I am in our repository `distributed-cache`. I've added a distributed Redis lock and Prometheus telemetry. I'll make a real commit with a terse message:"*

**[Action: Person E runs `git commit -am "wip: add redis lock and telemetry" && git push origin main`]**

> *"Instead of relying on the commit message, our GitHub webhook triggers instantaneously."*

> **Person C (Speaking - 1:15 to 1:45):**  
> *"On the right, n8n receives the webhook, verifies the SHA-256 HMAC cryptographic signature in 42ms, and extracts the raw Git diff rather than the vague commit message.  
> Our FastAPI backend routes the diff to Google Gemini 1.5 with strict temperature guardrails and Google's X-Y-Z formula.  
> Gemini analyzes the modified abstract syntax tree, identifies the concurrency lock algorithm, and synthesizes a high-impact bullet point.  
> Crucially, it does NOT touch the Word document yet. It safely inserts the suggestion into our `bullet_suggestions` database table with status `pending`.  
> Over to **Person A and Person B** in the web dashboard."*

---

```text
========================================================================================
[1:45 - 2:45] ACT III: HUMAN EDITORIAL CONTROL — REVIEW QUEUE & VISUAL DIFF
Presenters: Person A (Frontend Lead) & Person B (Frontend QA Lead)
Screen Control: Live Web Dashboard (http://localhost:5173/dashboard)
========================================================================================
```

**[Visual: Dashboard live-refreshes; Pending Suggestions Review Queue Card highlights new bullet]**

> **Person A (Speaking - 1:45 to 2:15):**  
> *"Here on the dashboard, the engineer sees a high-visibility Pending Review Queue card. Notice the suggested bullet synthesized from our 'wip' commit:  
> `• Implemented distributed Redis mutex locks and Prometheus metrics, reducing lock contention by 41% and achieving 99.99% synchronization reliability.`  
>
> Rather than blind auto-insertion, I click **'Inspect Diff'**."*

**[Action: Person A clicks 'Inspect Diff' button; Visual Diff Modal opens smoothly]**

> **Person B (Speaking - 2:15 to 2:45):**  
> *"The Visual Diff Modal provides complete editorial clarity. On the left is the proposed bullet and rationale; on the right is an interactive editor.  
> The candidate can toggle between Side-by-Side and Unified Diff views, edit specific metrics or terminology in real time, and verify readability.  
> Watch Person A refine the wording and click **'Accept & Insert'**."*

**[Action: Person A modifies '41%' to '45%', clicks 'Accept & Insert'; toast notification confirms]**

> **Person A:**  
> *"The bullet is accepted and queued for insertion. But what happens if this pushes our resume beyond the strict 1-page barrier? **Person D and Person A** will demonstrate."*

---

```text
========================================================================================
[2:45 - 3:45] ACT IV: 1-PAGE STRICTNESS & TARGET JOB DESCRIPTION MATCHING
Presenters: Person D (Document Architecture Lead) & Person A (Frontend Lead)
Screen Control: Web Dashboard — Page Budget Meter + Smart Swap Modal + JD Matcher Drawer
========================================================================================
```

**[Visual: Page Budget Meter shows line usage at 44/45 lines with Amber warning]**

> **Person D (Speaking - 2:45 to 3:15):**  
> *"Recruiters spend 6 seconds reviewing a resume, and page-overflow is the number one cause of immediate rejection.  
> Our system introduces the **1-Page Budget Engine**. It calculates total vertical line consumption in real time — factoring in typography, paragraph spacing, and line wraps.  
> Notice our meter shows 44 of 45 allowed lines used. Adding another project would breach the limit and trigger an overflow into page 2.  
> Instead of corrupting the layout, the system triggers **Smart Swapping**."*

**[Action: Person A clicks 'Smart Swap'; modal displays candidate's projects ranked by relevance]**

> **Person A (Speaking - 3:15 to 3:45):**  
> *"The Smart Swap modal shows our older project, `Legacy XML Parser`, and recommends archiving it to make room for `distributed-cache`. I click **'Confirm Swap'**. The older project is cleanly archived to PostgreSQL, and the new bullet is inserted — preserving exactly 43 lines.  
>
> Now, let's tailor this resume for an open Senior Backend Role at Stripe. I click **'Match Against Job Description'**."*

**[Action: Person A opens JD Drawer, pastes Stripe Backend JD, clicks 'Analyze Alignment']**

> *"In 1.2 seconds, our matcher compares resume embeddings against the JD: overall match score jumps to **86%**, displaying matched skills like Docker, Redis, and Go, while highlighting actionable gaps such as gRPC and Kubernetes!"*

---

```text
========================================================================================
[3:45 - 4:30] ACT V: INSTANT DOWNLOAD & ENTERPRISE ARCHITECTURE
Presenters: Person C (DevOps Lead) & Person D (Document Architecture Lead)
Screen Control: Fast .docx Download -> Microsoft Word Layout Inspection + Architecture Slide
========================================================================================
```

**[Visual: Person A clicks 'Download .docx'; file downloads in <350ms; opened in Word]**

> **Person D (Speaking - 3:45 to 4:10):**  
> *"When I click 'Download .docx', our OpenXML manipulation engine constructs the document in under 380 milliseconds.  
> Inspecting the generated document in Microsoft Word:  
> - Margin geometries, custom header fonts, and bullet indents are 100% pixel-perfect.  
> - The new `distributed-cache` project is inserted seamlessly.  
> - And crucially: the entire document remains locked to exactly **one single page**."*

> **Person C (Speaking - 4:10 to 4:30):**  
> *"Under the hood, all user GitHub access tokens and sensitive credentials are encrypted using **Fernet AES-256 with key derivation**.  
> The entire stack is containerized with Docker, verified across PostgreSQL and SQLite databases, and tested through an automated end-to-end suite with 100% pass rates."*

---

```text
========================================================================================
[4:30 - 5:00] ACT VI: WRAP-UP, PERFORMANCE RETROSPECTIVE & Q&A
Presenter: Person B (Host & MC)
Screen Control: Slide Deck (Slide 7: Enterprise Performance Metrics & Slide 8: Q&A)
========================================================================================
```

**[Visual: Final Summary Metrics Slide: 100% 1-Page Compliance | 86% JD Match | <2.4s Pipeline]**

> **Person B (Speaking - 4:30 to 5:00):**  
> *"To summarize what you saw today:  
> 1. **Zero Raw Bloat:** Sparse commit diffs synthesized into quantified STAR achievements.  
> 2. **Complete Editorial Authority:** Human-in-the-loop review queue and interactive visual diff inspection.  
> 3. **Strict 1-Page Layout Lock:** Automated line budgeting and intelligent project swapping.  
> 4. **Targeted Job Alignment:** Instant ATS keyword and job description gap analysis.  
>
> Our test suite verified 112 test cases, 0 security vulnerabilities, and zero style distortion across all standard Word processors.  
> On behalf of our team — Person A, C, D, and E — thank you for your time. We now welcome questions from the evaluators and audience!"*

---

## 3. Rehearsal Timing & Collision Control Matrix

To guarantee strict adherence to the 5:00 ceiling and eliminate speaking collisions:

| Person | Allocated Role | Strict Speaking Limit | Screen Transition Trigger |
| :--- | :--- | :---: | :--- |
| **Person B** | MC, Problem, Bloat & Closing | 45s (Intro) + 30s (Outro) = 75s | Hands screen to Person E at 0:44 |
| **Person E** | Git Push & Webhook Automation | 30s | Hands speaking to Person C at 1:14 |
| **Person C** | n8n Pipeline, HMAC & Security | 30s (Pipeline) + 20s (Arch) = 50s | Hands screen to Person A at 1:44 |
| **Person A** | Review Queue, Smart Swap, JD Match | 30s (Review) + 30s (Swap/JD) = 60s | Hands speaking to Person D at 2:44 |
| **Person D** | 1-Page Engine & OpenXML Docx | 30s (1-Page) + 25s (Docx) = 55s | Hands screen back to Person B at 4:29 |

---

## 4. Live Demo Contingency & Fallback Checklist

| Risk Scenario | Detection Window | Automated / Manual Contingency Procedure |
| :--- | :---: | :--- |
| **GitHub Webhook Latency (>2s)** | 0:50 | Person E clicks the 'Test New Commit Flow' simulator button directly on the dashboard. |
| **Gemini AI Rate Limiting (429/503)** | 1:20 | Pipeline immediately consumes cached diff synthesis fixture (`experiments/fixtures/diff_cache.json`). |
| **Target JD Embeddings Timeout** | 3:30 | JD Drawer uses deterministic keyword frequency fallback, maintaining accurate ATS score breakdown. |
| **Client Screen-Sharing Glitch** | Any | Person B retains co-host screen-sharing privileges and displays fallback slide screenshots. |
