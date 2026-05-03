import os
import re

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Import Swal if needed
    if ('alert(' in content or 'window.confirm(' in content) and 'import Swal' not in content:
        # insert after the last import
        imports = re.findall(r'^import .*?;?\n', content, re.MULTILINE)
        if imports:
            last_import = imports[-1]
            content = content.replace(last_import, last_import + "import Swal from 'sweetalert2';\n")
        else:
            content = "import Swal from 'sweetalert2';\n" + content

    # Replace confirms
    # Example 1: if (window.confirm("Are you sure you want to delete this user?")) {
    # Replace with: const result = await Swal.fire({title: 'Confirm', text: "...", icon: 'warning', showCancelButton: true}); if (result.isConfirmed) {
    def confirm_replacer(match):
        text = match.group(1)
        return f"const result = await Swal.fire({{title: 'Confirm', text: {text}, icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes'}});\n        if (result.isConfirmed) {{\n"
    
    content = re.sub(r'if\s*\(\s*window\.confirm\((.*?)\)\s*\)\s*\{', confirm_replacer, content)

    # Example 2: if (!window.confirm("...")) return;
    def confirm_not_replacer(match):
        text = match.group(1)
        return f"const result = await Swal.fire({{title: 'Confirm', text: {text}, icon: 'warning', showCancelButton: true}});\n        if (!result.isConfirmed) return;"
    
    content = re.sub(r'if\s*\(\s*!window\.confirm\((.*?)\)\s*\)\s*return;', confirm_not_replacer, content)

    # Replace alerts
    # We will replace alert(msg) with Swal.fire(msg)
    # To make it smarter, we can check if msg contains 'Error' or 'Failed'
    def alert_replacer(match):
        msg = match.group(1)
        if 'Error' in msg or 'Failed' in msg or 'Invalid' in msg or 'Insufficient' in msg or 'FAIL' in msg:
            return f"Swal.fire('Error!', {msg}, 'error')"
        elif 'Success' in msg or 'Added' in msg or 'Updated' in msg or 'Deleted' in msg or 'Booked' in msg or 'Recorded' in msg or 'Delivered' in msg or 'Saved' in msg:
            return f"Swal.fire('Success!', {msg}, 'success')"
        else:
            return f"Swal.fire('Notice', {msg}, 'info')"

    content = re.sub(r'\balert\((.*?)\)', alert_replacer, content)

    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {path}')

src_dir = r'c:\Users\Lenovo\Desktop\MA Traders\ma-traders-frontend\src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.js'):
            process_file(os.path.join(root, file))
