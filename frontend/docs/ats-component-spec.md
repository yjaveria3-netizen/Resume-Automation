# ATS Score & Feedback Component Specification (Day 4)
**Prepared by:** Person B (Frontend Support, QA & Demo)  
**Hand-off to:** Person A (Frontend Lead — for Day 7 backend wiring)

---

## 1. Overview
The Day 4 ATS feedback system provides visual trust metrics for the Resume Auto-Updater. Modeled on ATS industry standards (Jobscan, Resume Worded), it translates raw backend keyword analysis and bullet metrics into an animated radial score gauge, 4-pillar breakdown, and categorized actionable feedback cards.

---

## 2. Component Interfaces & Props

### 2.1 `AtsScoreBadge.jsx`
Radial SVG circular progress meter with smooth stroke animation and color thresholds.

```typescript
interface AtsScoreBadgeProps {
  /** Numerical ATS score from 0 to 100 */
  score: number;
  /** Size preset ('sm' | 'md' | 'lg' | 'xl') or numeric pixel diameter */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number; // default: 'md' (160px)
  /** Stroke width in pixels */
  strokeWidth?: number; // default: 12px
  /** Whether to render the tier pill beneath the score */
  showTier?: boolean; // default: true
  /** Optional custom CSS classes */
  className?: string;
}
```

#### Color & Tier Threshold Rules:
| Score Range | Tier Label | Stroke Color | Background Track | Pill Styling |
|---|---|---|---|---|
| **80 – 100** | `Strong Match` | `emerald-500` (`#10B981`) | `emerald-500/15` | `bg-emerald-50 text-emerald-700` |
| **60 – 79** | `Moderate` | `amber-500` (`#F59E0B`) | `amber-500/15` | `bg-amber-50 text-amber-700` |
| **0 – 59** | `Needs Revision` | `rose-500` (`#F43F5E`) | `rose-500/15` | `bg-rose-50 text-rose-700` |

---

### 2.2 `AtsFeedbackList.jsx`
Renders categorized checklist items with pass / warning / critical failure badges and expandable actionable suggestions.

```typescript
interface FeedbackItem {
  id: string;
  /** Status determines color and icon */
  status: 'pass' | 'warn' | 'fail';
  /** Criteria tag (e.g. 'Action Verbs Used', 'Quantifiable Metrics Found', 'Keyword Alignment', 'Formatting Cleanliness') */
  category: string;
  /** Tab group mapping: 'Overview' | 'Keyword Match' | 'Bullet Improvements' */
  tabCategory?: string;
  /** Primary evaluation observation */
  message: string;
  /** Actionable recommendation explaining how to resolve */
  suggestion: string;
}

interface AtsFeedbackListProps {
  items: FeedbackItem[];
  filterCategory?: string; // default: 'All'
  filterStatus?: 'all' | 'pass' | 'warn' | 'fail'; // default: 'all'
  className?: string;
}
```

---

### 2.3 `AtsScoreCard.jsx`
Master container wrapping the radial badge, 4 core criterion breakdown bars, tab toggles, and feedback list.

```typescript
interface BreakdownCriterion {
  score: number; // 0-100
  label?: string;
  count?: number;
  target?: number;
  matched?: number;
  total?: number;
  status?: string;
}

interface AtsScoreBreakdown {
  actionVerbs: BreakdownCriterion;
  quantifiableMetrics: BreakdownCriterion;
  keywordAlignment: BreakdownCriterion;
  formattingCleanliness: BreakdownCriterion;
}

interface AtsScoreCardProps {
  score: number;
  tier?: string;
  breakdown: AtsScoreBreakdown;
  feedback: FeedbackItem[];
  lastAnalyzed?: string;
  onExport?: (reportData: object) => void;
  onRecalculate?: () => void;
  isAnalyzing?: boolean;
  className?: string;
}
```

---

## 3. Quick Integration Example for Person A

```jsx
import { AtsScoreCard, AtsScoreBadge } from '../components/ats';

// Usage in Dashboard or Resume View:
<AtsScoreCard
  score={resumeAtsData.score}
  tier={resumeAtsData.tier}
  breakdown={resumeAtsData.breakdown}
  feedback={resumeAtsData.feedback}
  lastAnalyzed={resumeAtsData.lastAnalyzed}
  onRecalculate={() => triggerAtsReanalysis()}
  onExport={(data) => exportAtsPdf(data)}
/>
```
