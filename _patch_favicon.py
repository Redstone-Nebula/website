import os
import time
import shutil
import re

TIMESTAMP = str(int(time.time()))  # e.g. 1780648...
NEW_FNAME = f'redstone-{TIMESTAMP}.png'
print('new filename:', NEW_FNAME)

root_dir = os.path.dirname(os.path.abspath(__file__))

# 1) 在每个已存在的 png 目录里复制一份带时间戳的新文件（内容还是那张红石png）
png_dirs = []
for root, dirs, files in os.walk(root_dir):
    # 跳过隐藏目录
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    if 'redstone.png' in files and os.path.basename(root) == 'png':
        src = os.path.join(root, 'redstone.png')
        dst = os.path.join(root, NEW_FNAME)
        shutil.copy2(src, dst)
        png_dirs.append(os.path.relpath(root, root_dir))
        print('copied to', os.path.relpath(dst, root_dir))

# 2) 把所有 html 里的 favicon 行（两行：icon 和 shortcut icon）都改为指向新文件名
#    并把查询参数也换成唯一 t=TIMESTAMP

total = 0
for root, dirs, files in os.walk(root_dir):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for f in files:
        if not f.endswith('.html'):
            continue
        p = os.path.join(root, f)
        with open(p, 'r', encoding='utf-8') as fp:
            content = fp.read()
        if 'redstone' not in content:
            continue

        # 找到两行 favicon：link rel="icon" ... redstone*.png ...
        # 以及 link rel="shortcut icon" ...
        # 把 href 里的文件名都改成 NEW_FNAME，并在后面加 &t=TIMESTAMP
        def _sub(m):
            prefix = m.group(1)   # rel=... 之前的内容
            href = m.group(2)     # href="..." 引号内的值
            suffix = m.group(3)   # 结尾

            # 处理 href：替换文件名 + 加/改查询参数
            if '?' in href:
                # 已有查询参数，追加 &t=
                new_href = re.sub(
                    r'[^/]+\.png(\?[^"]*)?',
                    lambda mm: NEW_FNAME + mm.group(1) + f'&t={TIMESTAMP}' if mm.group(1) else NEW_FNAME + f'?t={TIMESTAMP}',
                    href
                )
            else:
                new_href = re.sub(r'[^/]+\.png$', NEW_FNAME + f'?t={TIMESTAMP}', href)
            # 如果正则没替换成，保底一下
            if 'redstone' not in new_href or NEW_FNAME not in new_href:
                # 手动：保留前面的相对路径部分
                base = '/'.join(href.split('/')[:-1])
                fname = href.split('/')[-1]
                # 去掉旧查询参数
                base_fname = fname.split('?')[0]
                new_href = (base + '/' if base else '') + NEW_FNAME + f'?t={TIMESTAMP}'
            return f'{prefix}href="{new_href}"{suffix}'

        pattern = re.compile(r'(<link\s+rel="(?:shortcut\s+)?icon"[^>]*?)href="([^"]*redstone[^"]*)"([^>]*>)')
        new_content, n = pattern.subn(_sub, content)
        if n > 0:
            with open(p, 'w', encoding='utf-8') as fp:
                fp.write(new_content)
            total += 1
            print('patched', os.path.relpath(p, root_dir))

print('total html files patched:', total)
