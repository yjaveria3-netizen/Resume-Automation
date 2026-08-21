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
  ## Day 2 UI & Empty States Test Checklist

### Dashboard Page
- [x] **Empty State Card**: Verify "No Resume Uploaded Yet" card displays document icon, explanatory text, and CTA button.
- [x] **Navigation CTA**: Verify clicking "Upload Resume Now" successfully redirects to `/upload`.
- [x] **GitHub Connect Button**: Verify "Connect GitHub" button renders correctly inside the GitHub Status card.

### Upload Page
- [x] **Drag & Drop Zone**: Verify dashed drop zone displays cloud icon and supported formats note.
- [x] **File Preview Card**: Verify preview card displays sample file metadata (`my_resume.docx`, `1.2 MB`, `Ready to process` badge).
- [x] **Remove Action**: Verify trash icon button is visible and formatted properly on the file preview card.

---

## Day 3 Resume Preview & Download Toolbar QA Checklist

### Resume Preview Panel (`ResumePreview.jsx`)
- [x] **US Letter Proportion**: Verify preview container adheres to standard US Letter proportions (8.5:11 aspect ratio on desktop) with crisp white sheet background, subtle border (`border-khaki/40`), and realistic document padding.
- [x] **Typography & Section Hierarchy**:
  - [x] Header renders candidate name (`Alex Morgan`), target title, and contact links (Email, Phone, Location, GitHub, LinkedIn).
  - [x] Professional Summary section renders legible body copy with subtle section rule divider.
  - [x] Work Experience renders job title, company, dates, location, and bullet points with sage green markers.
  - [x] Projects & Skills sections render tech stacks and categorized tool listings cleanly.
- [x] **Loading Shimmer Skeleton (`isLoading={true}`)**:
  - [x] Displays pulse shimmer placeholder covering header, summary, experience, projects, and skills without layout shift.
- [x] **Empty Placeholder State (`isEmpty={true}`)**:
  - [x] Displays centered dashed container with document icon, explanatory message, format support indicators (.docx, .pdf), and "Upload Resume Now" CTA button.

### Action Toolbar (`ResumeActionBar.jsx`)
- [x] **Sticky Positioning**: Verify toolbar sticks neatly below header on scrolling without overlapping document content.
- [x] **Download CTA Button**:
  - [x] Displays format icon and dynamic label (`Download .docx` / `Download .pdf`).
  - [x] Triggers download feedback spinner and initiates file download.
- [x] **Format Selector Toggle**:
  - [x] Allows toggling between `.docx` (Word) and `.pdf` (PDF).
  - [x] Updates format badge and Download button text/icon synchronously.
- [x] **Copy Link Button**:
  - [x] Copies current preview URL to system clipboard and displays green checkmark "Link Copied!" confirmation.
- [x] **Re-generate Button**:
  - [x] Triggers spin animation and re-generates resume content preview.
- [x] **Status & Timestamp Badge**:
  - [x] Displays last-updated time badge (`Generated 2m ago` / `Generated just now`).

### Responsive & Viewport Scaling (`/preview-test`)
- [x] **Mobile (375px)**: Toolbar items wrap cleanly; preview sheet margins adjust to `p-6` without horizontal layout break.
- [x] **Tablet (768px)**: Document margins scale to `p-10`; action toolbar renders all action buttons on single/double tier.
- [x] **Widescreen Desktop (1280px+)**: Document sheet centers gracefully with `shadow-lg` and max-width `850px`.

---

## Day 4 ATS Score Feedback System QA Checklist

### Radial Score Gauge (`AtsScoreBadge.jsx`)
- [ ] **Radial SVG Progress Animation**: Verify stroke-dashoffset transitions smoothly when score value updates.
- [ ] **Score Color Tiers**:
  - [ ] **Score 80–100 (`#10B981` Emerald)**: Renders green progress stroke and 'Strong Match' pill.
  - [ ] **Score 60–79 (`#F59E0B` Amber)**: Renders amber progress stroke and 'Moderate' pill.
  - [ ] **Score <60 (`#F43F5E` Rose)**: Renders rose progress stroke and 'Needs Revision' pill.
- [ ] **Center Value Typography**: Verify bold integer score with `/100` subtitle centered properly across `sm`, `md`, `lg` presets.

### Categorized Feedback List (`AtsFeedbackList.jsx`)
- [ ] **Status Badges & Icons**:
  - [ ] `pass` status displays green checkmark icon with light emerald card border.
  - [ ] `warn` status displays amber warning icon with light amber card border.
  - [ ] `fail` status displays red X icon with light rose card border.
- [ ] **Actionable Suggestions**:
  - [ ] Clicking "View Actionable Advice" / "Hide Advice" expands and collapses detailed recommendations.
  - [ ] Category pill tags (`Action Verbs Used`, `Quantifiable Metrics Found`, `Keyword Alignment`, `Formatting Cleanliness`) render with distinct colors.

### Master Container & Tabs (`AtsScoreCard.jsx`)
- [ ] **Tab Switching**:
  - [ ] Clicking **"Overview"** tab shows high-level metrics and general structure tips.
  - [ ] Clicking **"Keyword Match"** tab filters feedback to matched/missing technical keywords.
  - [ ] Clicking **"Bullet Improvements"** tab filters feedback to action verb and metric enhancements.
- [ ] **Core Criteria Breakdown Bars**:
  - [ ] Renders 4 horizontal progress bars with percentage values and target indicators.
- [ ] **Export & Recalculate Actions**:
  - [ ] Clicking **"Export Report"** generates and triggers download of the plain-text ATS analysis report.
  - [ ] Clicking **"Re-calculate"** triggers loading spinner and simulated re-analysis toast.

### Responsive Scaling (`/ats-test`)
- [ ] **Mobile (375px)**: Breakdown cards and feedback cards stack vertically with touch targets $\ge 44\text{px}$.
- [ ] **Tablet (768px)**: 2-column breakdown grid renders without text clipping.
- [ ] **Desktop Full**: Master card renders with radial badge in left hero block and 4-pillar grid in right block.