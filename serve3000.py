import os, http.server, socketserver

socketserver.TCPServer.allow_reuse_address = True
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PORT = 3000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, *args): pass

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
