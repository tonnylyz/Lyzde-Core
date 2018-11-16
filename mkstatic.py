import os
import urllib.request
import shutil

static_file = [
    'css/article.css',
    'css/blog.css',
    'css/index.css',
    'img/enddle.png',
    'img/liby.png',
    'favicon.ico',
    'resume-yuanzhi-liang.pdf',
    'index.html',
    'blog.html'
]


def mkdir(d):
    if not os.path.exists(d):
        os.mkdir(d)


def mv(src, dst):
    if not os.path.exists(src):
        return
    os.rename(src, dst)


def main():
    shutil.rmtree('out')
    mkdir('out')
    mkdir('out/css')
    mkdir('out/img')
    mkdir('out/post')

    base_url = 'http://localhost:5000'

    for file in static_file:
        urllib.request.urlretrieve(base_url + '/' + file, 'out/' + file)

    for i in range(0xFF):
        try:
            _, headers = urllib.request.urlretrieve(base_url + '/post/' + str(i) + '.html', 'out/post/tmp.html')
        except urllib.request.URLError:
            continue
        mv('out/post/tmp.html', 'out/post/' + str(i) + '.html')

    return


if __name__ == '__main__':
    main()
