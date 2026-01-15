# EVA Backend Integration - Setup Guide

## Quick Test (5 Minutes)

### Step 1: Start EVA API Server

```powershell
cd "E:\The Human Algorithm\T2\agent"
python api\run_server.py
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Step 2: Update Website Environment

Edit `e:\resume-web\.env`:

```env
VITE_USE_EVA_BACKEND=true
VITE_EVA_API_URL=http://localhost:8000/api/chat
```

### Step 3: Start Website

```powershell
cd e:\resume-web
npm run dev
```

### Step 4: Test Chatbot

1. Open website (`http://localhost:5173`)
2. Click chatbot button (bottom-right)
3. Send a message
4. You should see: "EVA Backend is being integrated..."

---

## Current Status

✅ **API Endpoint Created** - FastAPI server with CORS
✅ **Website Updated** - Chatbot service connects to EVA
✅ **Fallback Ready** - Falls back to Gemini if EVA unavailable
⏳ **EVA Integration** - Coming next (connect to Orchestrator)

---

## Next Steps (Full EVA Integration)

1. Import EVA Orchestrator into `chat_endpoint.py`
2. Process messages through EVA's cognitive system
3. Return responses with emotional state
4. Enable memory persistence

---

## Testing Checklist

- [ ] EVA server starts without errors
- [ ] Website connects to EVA API (check Network tab)
- [ ] Chatbot sends/receives messages
- [ ] CORS allows website domain
- [ ] Fallback to Gemini works (if EVA is down)

---

## Troubleshooting

**"Failed to connect to EVA"**

- Make sure EVA server is running on port 8000
- Check firewall settings
- Verify CORS origins include `http://localhost:5173`

**"EVA API request failed: 500"**

- Check EVA server logs for errors
- Verify Python dependencies are installed

---

**Status:** EVA API infrastructure ready! 🚀
**Next:** Connect to EVA Orchestrator for full cognitive capabilities.
