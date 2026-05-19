from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET
path = Path(r'c:\programação\orcamento-familiar\NovoOrcamentoFamiliarTeste.xlsx')
print('file exists', path.exists())
with zipfile.ZipFile(path) as z:
    names = z.namelist()
    print('files count', len(names))
    sheets = [n for n in names if n.startswith('xl/worksheets/sheet')]
    print('sheets', sheets)
    rel = ET.fromstring(z.read('xl/workbook.xml'))
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    sheets_meta = rel.findall('.//ns:sheets/ns:sheet', ns)
    print('sheet names', [(s.get('name'), s.get('sheetId'), s.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')) for s in sheets_meta])
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    for sheet in sheets_meta:
        name = sheet.get('name')
        rid = sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        target = next((t.get('Target') for t in rels.findall('Relationship') if t.get('Id') == rid), None)
        print('sheet', name, target)
        data = ET.fromstring(z.read('xl/' + target))
        rows = data.findall('.//ns:row', ns)
        print('rows count', len(rows))
        for row in rows[:5]:
            values = [c.find('ns:v', ns).text if c.find('ns:v', ns) is not None else None for c in row.findall('ns:c', ns)]
            print(values)
