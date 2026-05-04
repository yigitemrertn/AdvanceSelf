@echo off
REM Advance Self UI in the browser. Start backend first: uvicorn app.main:app --reload --port 8000
REM PowerShell: run from this folder with  .\run_web.bat   (not "run_web.bat" alone)
set ADVANCESELF_WEB=1
set ADVANCESELF_WEB_PORT=8550
set ADVANCESELF_API_URL=http://127.0.0.1:8000/api/v1
REM Optional: listen on LAN — set ADVANCESELF_WEB_HOST=0.0.0.0 then open http://YOUR_IP:8550
python main.py
