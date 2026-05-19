from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET
path = Path(r'c:\programação\orcamento-familiar\NovoOrcamentoFamiliarTeste.xlsx')
with zipfile.ZipFile(path) as z:
    shared = {}
    if 'xl/sharedStrings.xml' in z.namelist():
        sroot = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for i, si in enumerate(sroot.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si')):
            text = ''.join(t.text or '' for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'))
            shared[i] = text
    rel_root = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rel_ns = {'pr': 'http://schemas.openxmlformats.org/package/2006/relationships'}
    rels = {r.get('Id'): r.get('Target') for r in rel_root.findall('pr:Relationship', rel_ns)}
    wb_root = ET.fromstring(z.read('xl/workbook.xml'))
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
    sheets = wb_root.findall('.//ns:sheets/ns:sheet', ns)
    for s in sheets:
        name = s.get('name')
        rid = s.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        target = rels[rid]
        print('\n=== sheet', name, target)
        data = ET.fromstring(z.read('xl/' + target))
        rows = data.findall('.//ns:row', ns)
        for row in rows[:20]:
            cells = []
            for c in row.findall('ns:c', ns):
                coord = c.get('r')
                typ = c.get('t')
                val = c.find('ns:v', ns)
                formula = c.find('ns:f', ns)
                if typ == 's' and val is not None:
                    value = shared[int(val.text)]
                else:
                    value = val.text if val is not None else None
                if formula is not None:
                    cells.append(f'{coord}:{formula.text}->{value}')
                else:
                    cells.append(f'{coord}:{value}')
            print(' | '.join(cells))
