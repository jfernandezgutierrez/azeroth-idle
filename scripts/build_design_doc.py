"""Build the reviewable Word edition from the versioned design source.

Run with the document runtime's Python and python-docx. No network required.
"""
from pathlib import Path
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs' / 'MASTER_PLAN.md'
OUTPUT = ROOT / 'docs' / 'Plan_maestro_Azeroth_Idle.docx'


def field(paragraph, instruction, cached=''):
    run = paragraph.add_run()
    begin = OxmlElement('w:fldChar'); begin.set(qn('w:fldCharType'), 'begin')
    code = OxmlElement('w:instrText'); code.set(qn('xml:space'), 'preserve'); code.text = instruction
    sep = OxmlElement('w:fldChar'); sep.set(qn('w:fldCharType'), 'separate')
    txt = OxmlElement('w:t'); txt.text = cached
    end = OxmlElement('w:fldChar'); end.set(qn('w:fldCharType'), 'end')
    for node in (begin, code, sep, txt, end): run._r.append(node)


def set_cell(cell, text, header=False, shade=False):
    cell.text = text
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    props = cell._tc.get_or_add_tcPr()
    margins = OxmlElement('w:tcMar')
    for name, value in [('top', 95), ('bottom', 95), ('left', 100), ('right', 100)]:
        n = OxmlElement('w:' + name); n.set(qn('w:w'), str(value)); n.set(qn('w:type'), 'dxa'); margins.append(n)
    props.append(margins)
    if header or shade:
        n = OxmlElement('w:shd'); n.set(qn('w:fill'), '263A4D' if header else 'F1F4F6'); props.append(n)
    borders = OxmlElement('w:tcBorders')
    for edge in ['top', 'left', 'bottom', 'right']:
        n = OxmlElement('w:' + edge); n.set(qn('w:val'), 'single'); n.set(qn('w:sz'), '4'); n.set(qn('w:color'), 'D9D9D9'); borders.append(n)
    props.append(borders)
    for p in cell.paragraphs:
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.04
        for r in p.runs:
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor.from_string('FFFFFF' if header else '000000')
            r.font.bold = header


def build():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width = Inches(8.2677); sec.page_height = Inches(11.6929)
    sec.top_margin = Inches(.72); sec.bottom_margin = Inches(.7)
    sec.left_margin = Inches(.78); sec.right_margin = Inches(.78)
    sec.header_distance = Inches(.3); sec.footer_distance = Inches(.32)
    normal = doc.styles['Normal']
    normal.font.name = 'Calibri'; normal.font.size = Pt(10.5); normal.font.color.rgb = RGBColor(0, 0, 0)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.1
    normal.paragraph_format.widow_control = True
    for name, size in [('Title', 28), ('Subtitle', 12), ('Heading 1', 19), ('Heading 2', 13), ('Heading 3', 11)]:
        s = doc.styles[name]; s.font.name = 'Calibri'; s.font.size = Pt(size); s.font.color.rgb = RGBColor(0,0,0)
        s.paragraph_format.space_before = Pt(10 if name != 'Title' else 0)
        s.paragraph_format.space_after = Pt(10)
        if name.startswith('Heading'): s.paragraph_format.keep_with_next = True
    doc.core_properties.title = 'Plan maestro de diseño y producción de Azeroth Idle'
    doc.core_properties.subject = 'Diseño de juego y plan de desarrollo'
    doc.core_properties.author = 'Proyecto Azeroth Idle'
    doc.core_properties.version = '1.0'
    doc.core_properties.keywords = 'RPG, diseño de juego, producción, Supabase'
    foot = sec.footer.paragraphs[0]
    foot.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    foot.add_run('Azeroth Idle  |  Plan maestro 1.0  |  ')
    field(foot, 'PAGE', '1')
    for r in foot.runs: r.font.size = Pt(8); r.font.color.rgb = RGBColor.from_string('595959')
    chunks = SOURCE.read_text(encoding='utf-8-sig').split('<!-- page -->')
    headings = re.findall(r'^## (\d+ .+)$', SOURCE.read_text(encoding='utf-8-sig'), re.M)
    for index, chunk in enumerate(chunks):
        if index:
            doc.add_page_break()
        if index == 1:
            doc.add_heading('Contenido', level=1)
            for title in headings:
                p = doc.add_paragraph(title)
                p.paragraph_format.space_after = Pt(6)
                p.paragraph_format.line_spacing = 1
                p.runs[0].font.size = Pt(10)
            doc.add_page_break()
        lines = chunk.strip().splitlines()
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line: i += 1; continue
            if line.startswith('|'):
                rows = []
                while i < len(lines) and lines[i].strip().startswith('|'):
                    cells = [v.strip() for v in lines[i].strip().strip('|').split('|')]
                    if not all(re.fullmatch(r':?-+:?', c) for c in cells): rows.append(cells)
                    i += 1
                cols = len(rows[0]); table = doc.add_table(rows=0, cols=cols)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER; table.autofit = False
                widths = ([1.35, 2.62, 2.73] if cols == 3 else [1.0, 2.03, 1.08, 2.59])
                for col, width in zip(table.columns, widths): col.width = Inches(width)
                for rowindex, cells in enumerate(rows):
                    row = table.add_row()
                    no_split = OxmlElement('w:cantSplit'); row._tr.get_or_add_trPr().append(no_split)
                    if rowindex == 0:
                        repeat = OxmlElement('w:tblHeader'); row._tr.get_or_add_trPr().append(repeat)
                    for cell, text, width in zip(row.cells, cells, widths):
                        cell.width = Inches(width); set_cell(cell, text, rowindex == 0, rowindex % 2 == 0)
                after = doc.add_paragraph(); after.paragraph_format.space_after = Pt(0); after.paragraph_format.space_before = Pt(0)
                after.paragraph_format.line_spacing = 1; after.add_run().font.size = Pt(3)
                continue
            if line.startswith('# '): doc.add_paragraph(line[2:], 'Title')
            elif line.startswith('### '): doc.add_heading(line[4:], level=2)
            elif line.startswith('## '): doc.add_heading(line[3:], level=1 if index else 2)
            else:
                p = doc.add_paragraph(line)
                if index == 0 and line.startswith('Documento de referencia'): p.style = doc.styles['Subtitle']
            i += 1
    settings = doc.settings.element
    update = OxmlElement('w:updateFields'); update.set(qn('w:val'), 'true'); settings.append(update)
    doc.save(OUTPUT)
    print(f'Created {OUTPUT} | {len(chunks)} content blocks | {len(doc.tables)} tables')


if __name__ == '__main__': build()
