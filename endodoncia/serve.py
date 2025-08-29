#!/usr/bin/env python3
"""
Simple HTTP server to serve the built static site
"""
import os
import sys
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent / "dist"), **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def serve_site(port=8000):
    """Serve the static site on localhost"""
    dist_dir = Path(__file__).parent / "dist"
    
    if not dist_dir.exists():
        print("❌ Error: dist directory not found. Run 'uv run build-site' first.")
        return
    
    print(f"🚀 Starting server...")
    print(f"📁 Serving: {dist_dir}")
    print(f"🌐 URL: http://localhost:{port}")
    print("📱 The site will open automatically in your browser")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        server = HTTPServer(('localhost', port), CustomHTTPRequestHandler)
        
        # Try to open the browser
        try:
            webbrowser.open(f'http://localhost:{port}')
        except:
            pass
            
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n✅ Server stopped by user")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} is already in use. Try a different port:")
            print(f"   python serve.py {port + 1}")
        else:
            print(f"❌ Server error: {e}")

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ Invalid port number")
            sys.exit(1)
    
    serve_site(port)