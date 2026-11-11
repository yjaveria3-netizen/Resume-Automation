import copy
import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx_engine.formatter import clone_font_style, clone_paragraph_style


def copy_num_pr(src_p, dst_p):
    """Copies numbering properties (numPr) from src_p to dst_p so the bullet glyph matches exactly."""
    if not src_p or not dst_p:
        return False
    try:
        src_pPr = src_p._p.pPr
        if src_pPr is not None:
            numPr = src_pPr.find(qn('w:numPr'))
            if numPr is not None:
                dst_pPr = dst_p._p.get_or_add_pPr()
                # remove existing numPr if any
                existing = dst_pPr.find(qn('w:numPr'))
                if existing is not None:
                    dst_pPr.remove(existing)
                dst_pPr.append(copy.deepcopy(numPr))
                return True
    except Exception:
        pass
    return False


def style_exists_in_doc(doc, style_name: str) -> bool:
    """Checks whether a style name exists in document styles."""
    try:
        _ = doc.styles[style_name]
        return True
    except KeyError:
        return False
