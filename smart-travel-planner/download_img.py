import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'https://image.shutterstock.com/image-photo/young-woman-hiker-taking-photo-260nw-358004198.jpg', 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)

with urllib.request.urlopen(req, context=ctx) as response, open('client/assets/login.jpg', 'wb') as out_file:
    out_file.write(response.read())
