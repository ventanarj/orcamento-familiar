from pathlib import Path
import zipfile
from xml.etree import ElementTree as ET
path = Path(r'c:\programação\orcamento-familiar\NovoOrcamentoFamiliarTeste.xlsx')
print('file exists', path.exists())
with zipfile.ZipFile(path) as z:
    print('has workbook rels:', 'xl/_rels/workbook.xml.rels' in z.namelist())
    print('has workbook:', 'xl/workbook.xml' in z.namelist())
    print('rel files sample:', [n for n in z.namelist() if 'workbook' in n or 'sheet' in n][:20])
    rel_xml = z.read('xl/_rels/workbook.xml.rels').decode('utf-8')
    print('rels xml:', rel_xml[:500])
    wb_xml = z.read('xl/workbook.xml').decode('utf-8')
    print('workbook xml:', wb_xml[:500])
