"""
Clone a template .prs ZIP, replacing BackupPresentation.json with new content
and updating BackupInfo.json with the current export timestamp.
Usage: python3 prs-zip-writer.py <template.prs> <new-bp.json> <output.prs>
"""
import sys
import json
import zipfile
from datetime import datetime, timezone

template_path, new_bp_path, output_path = sys.argv[1], sys.argv[2], sys.argv[3]

with open(new_bp_path, 'rb') as f:
    new_bp = f.read()

with zipfile.ZipFile(template_path, 'r') as zin:
    # Build updated BackupInfo with current timestamp
    backup_info = json.loads(zin.read('BackupInfo.json'))
    backup_info['exportedDate'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    new_backup_info = json.dumps(backup_info, separators=(',', ':')).encode('utf-8')

    with zipfile.ZipFile(output_path, 'w') as zout:
        for item in zin.infolist():
            if item.filename == 'BackupPresentation.json':
                info = zipfile.ZipInfo('BackupPresentation.json')
                info.compress_type = item.compress_type
                info.flag_bits = item.flag_bits
                info.create_system = item.create_system
                info.create_version = item.create_version
                info.extract_version = item.extract_version
                zout.writestr(info, new_bp)
            elif item.filename == 'BackupInfo.json':
                info = zipfile.ZipInfo('BackupInfo.json')
                info.compress_type = item.compress_type
                info.flag_bits = item.flag_bits
                info.create_system = item.create_system
                info.create_version = item.create_version
                info.extract_version = item.extract_version
                zout.writestr(info, new_backup_info)
            else:
                zout.writestr(item, zin.read(item.filename))
