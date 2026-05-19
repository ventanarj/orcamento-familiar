from pathlib import Path
import zipfile
from xml.etree import ElementTree as ET
path = Path(r'c:\programação\orcamento-familiar\NovoOrcamentoFamiliarTeste.xlsx')
with zipfile.ZipFile(path) as z:
    rel_xml = z.read('xl/_rels/workbook.xml.rels')
    rel_root = ET.fromstring(rel_xml)
    rel_ns = {'pr': 'http://schemas.openxmlformats.org/package/2006/relationships'}
    rels = {r.get('Id'): r.get('Target') for r in rel_root.findall('pr:Relationship', rel_ns)}
    wb_xml = z.read('xl/workbook.xml')
    wb_root = ET.fromstring(wb_xml)
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
    sheets = wb_root.findall('.//ns:sheets/ns:sheet', ns)
    for s in sheets:
        name = s.get('name')
        rid = s.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        target = rels[rid]
        print('sheet', name, target)
        data = ET.fromstring(z.read('xl/' + target))
        rows = data.findall('.//ns:row', ns)
        print('rows count', len(rows))
        for row in rows[:5]:
            values = []
            for c in row.findall('ns:c', ns):
                v = c.find('ns:v', ns)
                values.append(v.text if v is not None else None)
            print(values)
        print()
