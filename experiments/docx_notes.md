# Person D — Word .docx Structure Quirks & Findings (Day 3 & Day 4)

## 📌 Word Document XML Hierarchy Under the Hood
In Microsoft Word (`.docx`), a document is not plain text. It is a zipped XML structure (`word/document.xml`):
```text
Document
  └── Paragraphs (<w:p>)
        └── Runs (<w:r>)  --> Contains text slices with uniform formatting
              └── Text (<w:t>)
```

---

## 🔍 Key Findings & Structural Quirks

1. **Text Division Across Runs**:
   - A single paragraph is split into multiple `Run` objects whenever formatting changes (e.g. bold word, hyperlink, font color, or inline style change).
   - Simple string replacement (e.g. `text.replace("old", "new")`) breaks Word formatting because a single word or phrase may be split across multiple `<w:r>` tags.

2. **Heading & Section Detection**:
   - Heading names vary across templates (`Projects`, `Technical Projects`, `Key Projects`, `Selected Projects`).
   - Detection requires combining case-insensitive regex pattern matching with style name heuristics (`Heading 1`, `Heading 2`) and bold formatting checks.

3. **Bullet Formatting & Alignment**:
   - Bullets can be declared via paragraph styles (`List Bullet`) or explicit Unicode bullet characters (`•`, `-`, `*`) in custom templates.
   - Preserving indent and line spacing requires cloning both `paragraph_format` attributes (`space_before`, `space_after`, `left_indent`) and run font properties (`name`, `size`, `bold`, `color.rgb`).

4. **Table Structures**:
   - Paragraphs inside tables reside inside `<w:tbl> <w:tr> <w:tc> <w:p>` and are separate from `doc.paragraphs`. Section index scanning must account for paragraph hierarchy.
