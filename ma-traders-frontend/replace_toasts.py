import os
import re

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Import toast if needed
    if 'Swal.fire' in content and 'import toast' not in content:
        imports = re.findall(r'^import .*?;?\n', content, re.MULTILINE)
        if imports:
            last_import = imports[-1]
            content = content.replace(last_import, last_import + "import toast from 'react-hot-toast';\n")

    # Replace Swal.fire('Success!', msg, 'success') -> toast.success(msg)
    # Be careful with the quotes around msg. It can be a string literal or template literal.
    # We will use a regex to capture everything after 'Success!', until the last , 'success')
    content = re.sub(r"Swal\.fire\('Success!',\s*(.*?),\s*'success'\)", r"toast.success(\1)", content)
    
    # Replace Error
    content = re.sub(r"Swal\.fire\('Error!',\s*(.*?),\s*'error'\)", r"toast.error(\1)", content)

    # Replace Notice
    content = re.sub(r"Swal\.fire\('Notice',\s*(.*?),\s*'info'\)", r"toast(\1)", content)

    # Enhance confirm boxes
    # current pattern:
    # const result = await Swal.fire({title: 'Confirm', text: "...", icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes'});
    
    def confirm_replacer(match):
        text = match.group(1)
        # We will inject our custom class object to make it beautiful
        custom_class_str = "customClass: { popup: 'glass-form-card', title: 'gradient-title', confirmButton: 'btn-gradient-success', cancelButton: 'btn-gradient-danger' }"
        return f"const result = await Swal.fire({{title: 'Are you sure?', text: {text}, icon: 'warning', showCancelButton: true, background: 'rgba(255,255,255,0.9)', backdrop: 'rgba(0,0,0,0.4)', {custom_class_str}, confirmButtonText: 'Yes, proceed!'}});"
    
    content = re.sub(r"const result = await Swal\.fire\(\{title: 'Confirm', text: (.*?), icon: 'warning', showCancelButton: true.*?\}\);", confirm_replacer, content)

    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {path}')

src_dir = r'c:\Users\Lenovo\Desktop\MA Traders\ma-traders-frontend\src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.js'):
            process_file(os.path.join(root, file))
