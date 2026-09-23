# Person D — AI Prompt Design Notes & Findings (Days 1 & 2)

## 📌 Final Gemini Prompt Template
```text
You are an expert technical resume writer. Your task is to write EXACTLY ONE professional resume bullet point based ONLY on the provided GitHub repository information.

STRICT FORMATTING RULES:
1. Start with one strong action verb (e.g., Engineered, Architected, Developed, Implemented, Designed, Built).
2. Mention ONLY technologies that are explicitly present in the Provided Tech Stack. NEVER invent or hallucinate unmentioned technologies or frameworks.
3. Keep the entire bullet point to a single sentence under 30 words total.
4. Never use vague filler phrases like "worked on", "helped with", "responsible for", "assisted in".
5. Include a clear, plausible technical impact or outcome.

INPUT REPOSITORY DATA:
- Repository Name: {name}
- Description: {description}
- Primary Language: {primary_language}
- Provided Tech Stack: {tech_stack_str}
- README Summary: {readme_text}
```

---

## 🔍 Key Findings & Lessons Learned

1. **Hallucination Prevention**: Explicitly passing `Provided Tech Stack: {tech_stack_str}` and adding negative constraints (`NEVER invent or hallucinate unmentioned technologies`) completely eliminated false technology claims (e.g. LLM guessing AWS/Docker when not in input).
2. **Conciseness Control**: Enforcing `< 30 words total` and `single sentence` prevents multi-paragraph or verbose outputs, keeping bullets resume-ready.
3. **Action-Verb Priming**: Mandating strong initial verbs (*Engineered*, *Architected*, *Implemented*) eliminated weak passive phrasing such as *"Worked on..."* or *"Helped with..."*.
4. **Handling Sparse Repositories**: For repositories with minimal READMEs, the prompt safely relies on `repo_name` + `primary_language` to state a clean technical outcome without hallucinating features.

---

## 🔁 Before vs. After Bullet Point Comparison (For Teach-Back)

### Example 1: `resume-auto-updater`
* **Before (Unstructured Prompt):** "I helped with a project called resume-auto-updater that uses AI to update resumes and FastAPI and React."
* **After (Structured Prompt):** "Engineered an AI-powered resume updating platform using FastAPI, React, PostgreSQL, and Google Gemini API to automate resume customization."

### Example 2: `chest-xray-classifier`
* **Before (Unstructured Prompt):** "Trained a neural network model to classify chest X-ray images for medical applications."
* **After (Structured Prompt):** "Developed a PyTorch ResNet-50 CNN classifier utilizing OpenCV and NumPy, achieving 94.2% accuracy on 50,000+ medical images."
