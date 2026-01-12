import re

with open('products.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all product-gallery sections and add the end slide before closing
galleries = re.findall(r'(<div class="product-gallery".*?)(</div>\s*<div class="gallery-controls">)', content, re.DOTALL)

for i, (gallery_content, closing) in enumerate(galleries):
    # Check if end slide already exists
    if 'Периодичность готовый.png' not in gallery_content:
        # Add the new slide before gallery closing
        new_slide = '              <div class="gallery-slide">\n                <img src="img/product/end/Периодичность готовый.png" alt="Периодичность замены">\n              </div>\n            '
        replacement = gallery_content + new_slide + closing
        content = content.replace(gallery_content + closing, replacement, 1)

# Now update dots for each gallery-dots section
dots_sections = re.findall(r'<div class="gallery-dots">(.*?)</div>', content, re.DOTALL)

for dots_section in dots_sections:
    dot_count = dots_section.count('<span class="dot"')
    new_dot = f'\n              <span class="dot" onclick="currentSlide(this, {dot_count})"></span>'
    new_section = '<div class="gallery-dots">' + dots_section.rstrip() + new_dot + '\n            </div>'
    old_section = '<div class="gallery-dots">' + dots_section + '</div>'
    content = content.replace(old_section, new_section, 1)

with open('products.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done! Added end slides and dots to all products.')
