import os
import re

root_dir = os.path.dirname(os.path.abspath(__file__))

for root, dirs, files in os.walk(root_dir):
    # 跳过隐藏目录
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for f in files:
        if not f.endswith('.html'):
            continue
        p = os.path.join(root, f)
        rel = os.path.relpath(p, root_dir)
        with open(p, 'r', encoding='utf-8') as fp:
            content = fp.read()
        if 'redstone.png' not in content:
            continue
        if 'redstone-v2' in content:
            print('skip (already v2):', rel)
            continue

        # 模式：整行 <link rel="icon" ... href="...redstone.png..."> ... 换行
        pattern = re.compile(
            r'^([ \t]*)<link\s+rel="icon"([^>]*)href="([^"]*redstone\.png[^"]*)"([^>]*)>([ \t]*\r?\n)',
            re.MULTILINE
        )
        m = pattern.search(content)
        if not m:
            print('NO MATCH:', rel)
            continue

        indent = m.group(1)
        before = m.group(2)  # rel="icon" 之后、href 之前的属性
        href = m.group(3)    # 含相对路径和 ?v= 参数
        after = m.group(4)   # href 之后的属性
        eol = m.group(5)

        # 把 redstone.png 改为 redstone-v2.png
        href_v2 = href.replace('redstone.png', 'redstone-v2.png')

        line_icon = f'{indent}<link rel="icon"{before}href="{href_v2}"{after}>{eol}'
        line_shortcut = f'{indent}<link rel="shortcut icon"{before}href="{href_v2}"{after}>{eol}'

        replacement = line_icon + line_shortcut
        new_content = content[:m.start()] + replacement + content[m.end():]
        with open(p, 'w', encoding='utf-8') as fp:
            fp.write(new_content)
        print('patched:', rel)
