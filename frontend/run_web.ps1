# Advance Self UI in the browser. Start backend first:
#   cd ..\backend; uvicorn app.main:app --reload --port 8000
$env:ADVANCESELF_WEB = "1"
$env:ADVANCESELF_WEB_PORT = "8550"
$env:ADVANCESELF_API_URL = "http://127.0.0.1:8000/api/v1"
# Optional LAN: $env:ADVANCESELF_WEB_HOST = "0.0.0.0"
Set-Location $PSScriptRoot
python main.py
