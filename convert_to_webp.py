import os
import re
from PIL import Image

# Directory containing images
IMG_DIR = r'img/product'
HTML_FILE = 'products.html'

# Supported extensions to convert
EXTENSIONS = {'.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'}

def convert_images():
    converted_count = 0
    errors = []
    
    # Walk through the directory
    for root, dirs, files in os.walk(IMG_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            filename, ext = os.path.splitext(file)
            
            if ext in EXTENSIONS:
                webp_path = os.path.join(root, filename + '.webp')
                
                # Check if WebP already exists
                if not os.path.exists(webp_path):
                    try:
                        print(f"Converting: {file} -> {filename}.webp")
                        with Image.open(file_path) as img:
                            # Convert to RGB if needed (for PNGs with transparency)
                            if img.mode in ('RGBA', 'LA'):
                                # Keep transparency for WebP
                                img.save(webp_path, 'WEBP', quality=85)
                            else:
                                img.save(webp_path, 'WEBP', quality=85)
                        converted_count += 1
                    except Exception as e:
                        errors.append(f"Error converting {file}: {e}")
                else:
                    pass 
                    # print(f"Skipping {file}, WebP exists.")

    print(f"Conversion complete. {converted_count} new WebP files created.")
    if errors:
        print("\nErrors encountered:")
        for err in errors:
            print(err)

def update_html():
    if not os.path.exists(HTML_FILE):
        print(f"File {HTML_FILE} not found!")
        return

    with open(HTML_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # regex to find image sources in src="..." or data-images="..."
    # We look for extensions and replace them with .webp
    
    # Simple replace for src
    def replace_ext(match):
        full_match = match.group(0) # e.g. img/product/image.png
        # Check if the file actually exists as webp now
        # We assume the conversion step ran first.
        
        # Extract the path part to check existence
        # The group 0 is the full string "name.ext"
        # We need to be careful not to break paths.
        
        # Better approach: 
        # 1. Find all img/product/....(png|jpg|jpeg)
        # 2. Extract filename
        # 3. Check if corresponding .webp exists
        # 4. If yes, replace extension in string.
        
        rel_path = full_match.replace('/', os.sep) # fix separators for windows check
        # But my script runs in root, removing 'img/product' prefix might be needed depending on match
        return full_match
        
    # Let's iterate over known extensions and replace blindly IF file exists
    # This acts as global string replacement which is safer for HTML
    
    for root, dirs, files in os.walk(IMG_DIR):
        for file in files:
            if file.lower().endswith('.webp'):
                base_name = os.path.splitext(file)[0]
                
                # Possible old extensions
                for old_ext in EXTENSIONS:
                    old_file = base_name + old_ext
                    # Check if HTML contains reference to old file
                    # We look for "img/product/oldname.ext" or just "oldname.ext" (in data-images)
                    
                    # 1. Replace src="img/product/oldname.ext"
                    pattern_src = f'img/product/{re.escape(old_file)}'
                    replacement_src = f'img/product/{base_name}.webp'
                    
                    if pattern_src in content:
                        print(f"Updating HTML src: {old_file} -> {base_name}.webp")
                        content = content.replace(pattern_src, replacement_src)

                    # 2. Replace data-images="..., oldname.ext, ..."
                    # The pattern is just the filename in data-images list
                    # Be careful not to replace partial matches, usually separated by commas
                    # We can't use simple replace easily because filename might be common word.
                    # But given the specific naming, it's low risk.
                    
                    # Regex for data-images values? 
                    # Assuming data-images contains comma separated filenames
                    # We just replace the exact filename string if found
                    
                    if old_file in content:
                        # Check context? No, just replace.
                         # Avoid replacing if it's already part of a webp string (unlikely given ext)
                        content = content.replace(old_file, base_name + '.webp')
    
    if content != original_content:
        with open(HTML_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        print("HTML updated successfully.")
    else:
        print("No HTML changes needed.")

if __name__ == "__main__":
    convert_images()
    update_html()
