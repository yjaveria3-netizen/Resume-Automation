def clone_font_style(src_run, dst_run):
    """Clones font properties (name, size, bold, italic, underline, color) from src_run to dst_run."""
    if not src_run or not dst_run:
        return

    try:
        src_font = src_run.font
        dst_font = dst_run.font

        if src_font.name is not None:
            dst_font.name = src_font.name
        if src_font.size is not None:
            dst_font.size = src_font.size
        if src_font.bold is not None:
            dst_font.bold = src_font.bold
        if src_font.italic is not None:
            dst_font.italic = src_font.italic
        if src_font.underline is not None:
            dst_font.underline = src_font.underline

        # Copy font color if specified
        if hasattr(src_font, "color") and src_font.color and src_font.color.rgb:
            dst_font.color.rgb = src_font.color.rgb
    except Exception:
        pass


def clone_paragraph_style(src_p, dst_p):
    """Clones paragraph formatting (spacing, line_spacing, indent, alignment, style) from src_p to dst_p."""
    if not src_p or not dst_p:
        return

    try:
        if hasattr(src_p, "style") and src_p.style:
            dst_p.style = src_p.style

        src_fmt = src_p.paragraph_format
        dst_fmt = dst_p.paragraph_format

        if src_fmt.space_before is not None:
            dst_fmt.space_before = src_fmt.space_before
        if src_fmt.space_after is not None:
            dst_fmt.space_after = src_fmt.space_after
        if src_fmt.line_spacing is not None:
            dst_fmt.line_spacing = src_fmt.line_spacing
        if src_fmt.left_indent is not None:
            dst_fmt.left_indent = src_fmt.left_indent
        if src_p.alignment is not None:
            dst_p.alignment = src_p.alignment
    except Exception:
        pass
