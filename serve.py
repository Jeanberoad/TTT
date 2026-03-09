import http.server
import socketserver
import socket

PORT = 5000

class HotspotHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/login.html'
        return super().do_GET()

    def log_message(self, format, *args):
        pass

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableTCPServer(("0.0.0.0", PORT), HotspotHandler) as httpd:
    print(f"Serving HTTP on 0.0.0.0 port {PORT} ...")
    httpd.serve_forever()
