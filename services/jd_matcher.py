import difflib
import re
from pathlib import Path
from typing import Dict, Any, List, Set, Tuple, Optional
import docx

# Canonical skill taxonomy and aliases mapping
SKILL_ALIASES = {
    # Databases & storage
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "pgsql": "postgresql",
    "mysql": "mysql",
    "mongodb": "mongodb",
    "mongo": "mongodb",
    "redis": "redis",
    "sqlite": "sqlite",
    "dynamodb": "dynamodb",
    "cassandra": "cassandra",
    "clickhouse": "clickhouse",
    "elasticsearch": "elasticsearch",

    # Cloud & DevOps
    "kubernetes": "kubernetes",
    "k8s": "kubernetes",
    "docker": "docker",
    "aws": "aws",
    "amazon web services": "aws",
    "gcp": "gcp",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "azure": "azure",
    "microsoft azure": "azure",
    "terraform": "terraform",
    "ansible": "ansible",
    "helm": "helm",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "gitlab": "gitlab",
    "github actions": "github actions",
    "jenkins": "jenkins",
    "prometheus": "prometheus",
    "grafana": "grafana",
    "linux": "linux",

    # Programming Languages
    "python": "python",
    "python3": "python",
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "java": "java",
    "golang": "go",
    "rust": "rust",
    "ruby": "ruby",
    "php": "php",
    "swift": "swift",
    "kotlin": "kotlin",
    "scala": "scala",
    "c++": "c++",
    "cpp": "c++",
    "c#": "c#",
    "csharp": "c#",

    # Frameworks & Libraries
    "fastapi": "fastapi",
    "flask": "flask",
    "django": "django",
    "spring": "spring boot",
    "spring boot": "spring boot",
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "next.js": "next.js",
    "nextjs": "next.js",
    "vue": "vue",
    "vuejs": "vue",
    "vue.js": "vue",
    "angular": "angular",
    "node.js": "node.js",
    "nodejs": "node.js",
    "node": "node.js",
    "express": "express",
    "express.js": "express",
    "expressjs": "express",
    "graphql": "graphql",
    "grpc": "grpc",
    "rabbitmq": "rabbitmq",
    "kafka": "kafka",
    "apache kafka": "kafka",
    "spark": "apache spark",
    "apache spark": "apache spark",

    # ML / AI / Data
    "pytorch": "pytorch",
    "tensorflow": "tensorflow",
    "scikit-learn": "scikit-learn",
    "pandas": "pandas",
    "numpy": "numpy",
    "opencv": "opencv",

    # Web & Version Control
    "html": "html",
    "html5": "html",
    "css": "css",
    "css3": "css",
    "tailwind": "tailwind",
    "tailwindcss": "tailwind",
    "bootstrap": "bootstrap",
    "sass": "sass",
    "git": "git",
    "rest": "rest",
    "restful": "rest",
}

# Stopwords that must never be counted as technical skills
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between",
    "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't",
    "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
    "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
    "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
    "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in",
    "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most",
    "must", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
    "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
    "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
    "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
    "they're", "they've", "this", "those", "through", "to", "too", "under", "until",
    "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while",
    "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you",
    "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
    # Jargon stopwords
    "experience", "years", "role", "work", "working", "team", "strong", "ability",
    "skills", "candidate", "responsibilities", "requirements", "preferred", "plus",
    "qualification", "qualifications", "degree", "bachelor", "master", "company",
    "job", "opportunity", "hands-on", "knowledge", "including", "familiarity",
    "understanding", "demonstrated", "proven", "excellent", "written", "verbal",
    "communication", "problem-solving", "interpersonal", "collaborate", "cross-functional",
    "good", "have", "need", "plus", "bonus", "nice", "looking", "developer", "engineer"
}

# Section detection regexes
REQUIRED_SECTION_REGEX = re.compile(
    r"\b(required|must\s+have|minimum\s+qualifications?|basic\s+qualifications?|core\s+requirements?|requirements?)\b",
    re.IGNORECASE
)

BONUS_SECTION_REGEX = re.compile(
    r"\b(nice\s+to\s+have|bonus|preferred\s+qualifications?|desired\s+qualifications?|good\s+to\s+have|pluses?)\b",
    re.IGNORECASE
)

# Regex to verify ambiguous terms like "Go"
GO_PATTERN = re.compile(
    r"(?:\bGolang\b|\bGo\s*(?:lang|\/|,|;|and|\bor\b|backend|developer|engineer|programming)|(?:Python|Java|C\+\+|Rust)\s*(?:\/|,)\s*Go\b|\busing\s+Go\b)",
    re.IGNORECASE
)
GO_CAPITAL_PATTERN = re.compile(r"\bGo\b")


def extract_skills_from_text(text: str, is_jd: bool = False) -> Dict[str, float]:
    """Extracts canonical skills and their section weights from text.
    For JDs: parses sections to assign 2.0x weight to Required, 1.0x to Bonus.
    Returns: dict of {canonical_skill: weight}
    """
    lines = text.splitlines()
    skill_weights: Dict[str, float] = {}

    current_weight = 2.0 if is_jd else 1.0  # Default to 2.0 (Required) for JDs

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if is_jd:
            if BONUS_SECTION_REGEX.search(stripped):
                current_weight = 1.0
            elif REQUIRED_SECTION_REGEX.search(stripped):
                current_weight = 2.0

        lower_line = stripped.lower()

        # Check for ambiguous term "go"
        if "go" in lower_line:
            # Must match Go pattern specifically or capital Go in skills line
            if GO_PATTERN.search(stripped) or (GO_CAPITAL_PATTERN.search(stripped) and ("," in stripped or "|" in stripped or "skills" in lower_line)):
                canonical = "go"
                skill_weights[canonical] = max(skill_weights.get(canonical, 0.0), current_weight)

        # Match against our taxonomy
        for alias, canonical in SKILL_ALIASES.items():
            if alias == "go":
                continue  # handled separately above

            # Word boundary search for alias; prevent .js or .ts from triggering inside Node.js
            if alias in ("js", "ts"):
                pattern = r"(?<![a-zA-Z0-9.])" + re.escape(alias) + r"(?![a-zA-Z0-9])"
            else:
                pattern = r"(?<![a-zA-Z0-9])" + re.escape(alias) + r"(?![a-zA-Z0-9])"
            if re.search(pattern, lower_line):
                # Ensure alias is not in stopwords
                if alias not in STOPWORDS:
                    skill_weights[canonical] = max(skill_weights.get(canonical, 0.0), current_weight)

    return skill_weights


def extract_resume_tokens(text: str) -> List[str]:
    """Extracts non-stopword tokens from resume text for fuzzy matching."""
    raw_tokens = re.findall(r"[a-zA-Z0-9+#.-]+", text.lower())
    return [t for t in raw_tokens if t not in STOPWORDS and len(t) >= 2]


def check_skill_match_in_resume(canonical_skill: str, resume_lower: str, resume_tokens: List[str]) -> bool:
    """Checks if a canonical skill matches the resume via:
    1. Exact match of any alias in resume text
    2. Fuzzy match (ratio >= 0.90) against resume tokens
    """
    # 1. Ambiguous check for Go
    if canonical_skill == "go":
        return bool(GO_PATTERN.search(resume_lower) or GO_CAPITAL_PATTERN.search(resume_lower))

    # 2. Check all aliases of this canonical skill
    aliases = [alias for alias, can in SKILL_ALIASES.items() if can == canonical_skill]
    for alias in aliases:
        if alias in ("js", "ts"):
            pattern = r"(?<![a-zA-Z0-9.])" + re.escape(alias) + r"(?![a-zA-Z0-9])"
        else:
            pattern = r"(?<![a-zA-Z0-9])" + re.escape(alias) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, resume_lower):
            return True

    # 3. Fuzzy matching via difflib.SequenceMatcher (ratio >= 0.90)
    for alias in aliases:
        if len(alias) <= 3:
            continue  # Do not fuzzy-match short abbreviations like ts, js, aws
        for token in resume_tokens:
            if abs(len(token) - len(alias)) <= 2:
                ratio = difflib.SequenceMatcher(None, token, alias).ratio()
                if ratio >= 0.90:
                    return True

    return False


def compute_jd_match_score(docx_path: str, job_description_text: str) -> Dict[str, Any]:
    """Compares uploaded resume text against a Job Description to compute an honest 0-100 match score:
    - Section-weighted: Required skills (2x) vs Nice-to-have / Bonus (1x).
    - Taxonomy + aliases normalization (e.g., PostgreSQL == Postgres, K8s == Kubernetes).
    - Fuzzy matching via difflib (ratio >= 0.90).
    - True 0 match score if no skills match or no skills in JD (never defaults to 70%).
    - Deterministic output sorted by (weight desc, skill asc).
    """
    path = Path(docx_path)
    resume_text = ""
    if path.exists():
        try:
            doc = docx.Document(docx_path)
            paragraphs_text = [p.text for p in doc.paragraphs if p.text.strip()]
            tables_text = []
            for t in doc.tables:
                for row in t.rows:
                    for cell in row.cells:
                        tables_text.append(cell.text.strip())
            resume_text = "\n".join(paragraphs_text + tables_text)
        except Exception:
            resume_text = ""

    resume_lower = resume_text.lower()
    resume_tokens = extract_resume_tokens(resume_text)

    # Extract JD skills with section weights
    jd_skills = extract_skills_from_text(job_description_text, is_jd=True)

    if not jd_skills:
        return {
            "match_score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "recommendations": ["No technical skills detected in the job description."],
            "message": "no skills detected"
        }

    matched_skills: List[Tuple[str, float]] = []
    missing_skills: List[Tuple[str, float]] = []

    total_weighted_points = sum(jd_skills.values())
    matched_weighted_points = 0.0

    for skill, weight in jd_skills.items():
        if check_skill_match_in_resume(skill, resume_lower, resume_tokens):
            matched_skills.append((skill, weight))
            matched_weighted_points += weight
        else:
            missing_skills.append((skill, weight))

    if total_weighted_points > 0:
        match_score = int(round((matched_weighted_points / total_weighted_points) * 100))
    else:
        match_score = 0

    # Ensure score is within honest [0, 100] bounds
    match_score = max(0, min(100, match_score))

    # Sort deterministically: weight descending, then alphabetical ascending
    matched_skills.sort(key=lambda item: (-item[1], item[0]))
    missing_skills.sort(key=lambda item: (-item[1], item[0]))

    matched_keywords = [skill for skill, _ in matched_skills]
    missing_keywords = [skill for skill, _ in missing_skills]

    recommendations = []
    if missing_keywords:
        top_missing = ", ".join(missing_keywords[:4])
        recommendations.append(f"Incorporate missing core technologies from JD: {top_missing}.")
    if match_score < 75:
        recommendations.append("Align project descriptions more closely with the specific requirements listed in the job post.")
    else:
        recommendations.append("Strong keyword alignment with the target job description!")

    return {
        "match_score": match_score,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "recommendations": recommendations
    }
