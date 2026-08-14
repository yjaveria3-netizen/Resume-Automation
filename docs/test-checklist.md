# Resume Auto-Updater — QA Test Checklist & Design System (Day 1)

## 1. Project Design Tokens & Conventions

### Color Palette & Theme Decisions (Synced with `tailwind.config.js`)
* **Background Fill:** `khaki.light` (`#F5F2EB`) — Used for full-page backgrounds and light canvas areas.
* **Warm Neutral / Cards:** `khaki` (`#C3B091`) — Used for card borders, subtle accents, and container dividers.
* **Dark Structural Elements:** `olive-wood` (`#2C302E`) — Used for dark navigation bars, section headings, and primary body text.
* **Primary Interactive Control:** `sage` (`#8A9A86`) — Used for CTAs (e.g., "Update Resume", "Connect GitHub") and success state badges.
* **Button Hover State:** `sage.hover` (`#73836F`) — Applied to primary buttons for active focus and hover transitions.

### Component Folder Convention
To maintain project structure across team members, all front-end code follows this layout:
* `components/ui/` — Atomic reusable UI elements (e.g., `Button.tsx`, `Input.tsx`, `Badge.tsx`, `Modal.tsx`).
* `components/layout/` — Structural layout containers (e.g., `Navbar.tsx`, `Sidebar.tsx`, `Footer.tsx`).
* `components/features/` — Feature-specific components (e.g., `GithubConnectCard.tsx`, `ResumeUploader.tsx`, `AtsScoreGauge.tsx`).

---

## 2. Manual QA Checklist

### Auth
- [ ] **Sign Up**
  - [ ] Click **"Sign Up"** after entering valid email, name, and password $\rightarrow$ Account is created, session is saved, and user is redirected to dashboard.
  - [ ] Click **"Sign Up"** with an existing email address $\rightarrow$ Displays error message *"An account with this email already exists"* and blocks submission.
- [ ] **Log In & Log Out**
  - [ ] Click **"Log In"** with valid credentials $\rightarrow$ User is authenticated and navigated to the main dashboard.
  - [ ] Click **"Log Out"** in header navigation $\rightarrow$ Session tokens clear and user is redirected to the login screen.

### GitHub Connect
- [ ] **OAuth Authentication**
  - [ ] Click **"Connect GitHub Account"** button $\rightarrow$ Redirects cleanly to GitHub's secure OAuth authorization page.
  - [ ] Click **"Authorize"** on GitHub $\rightarrow$ Redirects back to app with a green *"GitHub Connected"* status badge showing the username.
- [ ] **Repository Fetching & Ranking**
  - [ ] View repo list post-connection $\rightarrow$ App automatically fetches public repos and ranks them by activity, stars, and language relevance.
  - [ ] Click **"Resync Repos"** button $\rightarrow$ Re-fetches updated GitHub repositories without forcing full re-authorization.

### Upload
- [ ] **Resume File Handling**
  - [ ] Drop or upload a valid `.docx` file $\rightarrow$ File is accepted, filename and size display, and green upload indicator appears.
  - [ ] Click **"Remove File"** icon $\rightarrow$ Clears selected file from state and resets drop zone.

### Update and AI
- [ ] **AI Generation & Diff**
  - [ ] Click **"Update Resume"** button $\rightarrow$ Enters disabled loading state with animated spinner and status message (*"Analyzing GitHub activity..."*).
  - [ ] Complete AI processing $\rightarrow$ Generated bullet points based on GitHub repos insert into appropriate resume sections.
  - [ ] Click **"Toggle Diff View"** $\rightarrow$ Toggles side-by-side or highlighted comparison showing original vs. new AI bullet points.

### Score
- [ ] **ATS Scoring & Feedback**
  - [ ] View ATS score after update $\rightarrow$ Numeric score (0–100) displays with matching color indicator (red/yellow/green).
  - [ ] Click **"View ATS Tips"** $\rightarrow$ Expands actionable recommendations (e.g., keyword density, missing formatting).
  - [ ] Click **"Re-calculate Score"** $\rightarrow$ Recalculates dynamically based on edits made.

### History
- [ ] **Version Control**
  - [ ] Click **"Version History"** tab $\rightarrow$ Displays chronological list of past resume builds with timestamps and scores.
  - [ ] Click **"Download"** on any version $\rightarrow$ Triggers browser download for selected `.docx` file.
  - [ ] Click **"Restore Version"** $\rightarrow$ Sets selected past build as active version in preview window.

### Mobile and Responsiveness
- [ ] **Responsive Design**
  - [ ] Open app on mobile width (375px) $\rightarrow$ Navigation collapses into hamburger menu; cards stack vertically without horizontal overflow.
  - [ ] Tap **"Connect GitHub"** or **"Upload Resume"** on mobile $\rightarrow$ Native file picker / OAuth window opens cleanly without modal overlap.
  - [ ] Scroll ATS Score & History cards on mobile $\rightarrow$ Touch targets measure at least 44x44px and text remains legible.

### Error States
- [ ] **System & Validation Errors**
  - [ ] Upload invalid file type (`.pdf`, `.png`) $\rightarrow$ Red error notification displays: *"Invalid file format. Please upload a .docx document."*
  - [ ] Click **"Update Resume"** before connecting GitHub $\rightarrow$ Warning modal pops up requesting GitHub authorization first.
  - [ ] Disconnect internet and click **"Update Resume"** $\rightarrow$ Toast notification displays: *"Connection lost. Please check your network and try again."*
  - [ ] Trigger server API failure $\rightarrow$ Alert displays with an explicit error message and a **"Retry"** button.