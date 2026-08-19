"""
Suryavedh Platform Unified Launcher.
Starts both the FastAPI scientific backend (port 8000) and the Vite 3D frontend (port 5173).
"""

import subprocess
import sys
import time
import os
import urllib.request


def check_backend_ready(url="http://127.0.0.1:8000/api/health", max_retries=15):
    for i in range(max_retries):
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status == 200:
                    return True
        except Exception:
            time.sleep(1)
    return False


def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Python executable inside venv or sys.executable
    venv_python = os.path.join(root_dir, ".venv", "Scripts", "python.exe")
    python_exe = venv_python if os.path.exists(venv_python) else sys.executable

    print("=" * 65)
    print("  SURYAVEDH — Urban Solar Intelligence & Digital Twin")
    print("  Simulate Tomorrow. Protect Solar Today.")
    print("=" * 65)
    print(f"[*] Root Directory: {root_dir}")
    print(f"[*] Using Python:   {python_exe}")

    # Launch FastAPI Backend
    print("[*] Launching Scientific Backend on http://127.0.0.1:8000...")
    backend_proc = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=backend_dir
    )

    if check_backend_ready():
        print("[+] Backend is ONLINE & Healthy: http://127.0.0.1:8000/docs")
    else:
        print("[!] Backend starting in background...")

    # Launch Vite Frontend
    print("[*] Launching 3D Digital Twin Frontend on http://localhost:5173...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev", "--", "--host"],
        cwd=frontend_dir,
        shell=True
    )

    print("\n" + "=" * 65)
    print("  SURYAVEDH PLATFORM READY!")
    print("  Open Browser at:  http://localhost:5173")
    print("  API Docs at:      http://127.0.0.1:8000/docs")
    print("=" * 65 + "\n")

    try:
        while True:
            time.sleep(2)
    except KeyboardInterrupt:
        print("\n[*] Shutting down Suryavedh services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("[+] Shutdown complete.")


if __name__ == "__main__":
    main()
