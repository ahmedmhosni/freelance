# 🚀 AI Assistant - Quick Start Guide

## ✅ What's Done

**Backend is 100% complete and ready to use!**

- ✅ Database tables created
- ✅ Gemini AI integrated (FREE forever)
- ✅ Admin control panel (API ready)
- ✅ Rate limiting (10/hour, 50/day per user)
- ✅ Usage tracking & analytics
- ✅ Ready to switch to Azure OpenAI later

---

## 🎯 How to Enable & Test (Right Now)

### **Step 1: Restart Backend**
```bash
cd backend
npm run dev
```

### **Step 2: Test with cURL (No Frontend Needed)**

**A. Check Status (Should be disabled):**
```bash
curl http://localhost:5000/api/ai/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**B. Enable AI (Admin Only):**
```bash
curl -X PUT http://localhost:5000/api/admin/ai/settings \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

**C. Send Message:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I create an invoice?"}'
```

**You should get a response from Gemini AI!** 🎉

---

## 📋 Admin Panel Features (API Ready)

### **Enable/Disable AI:**
```bash
PUT /api/admin/ai/settings
Body: {"enabled": true}
```

### **Set Rate Limits:**
```bash
PUT /api/admin/ai/settings
Body: {
  "maxRequestsPerHour": 10,
  "maxRequestsPerDay": 50
}
```

### **View Analytics:**
```bash
GET /api/admin/ai/analytics?days=7
```

### **View User Usage:**
```bash
GET /api/admin/ai/users
```

### **View Conversations:**
```bash
GET /api/admin/ai/conversations?limit=50
```

---

## 🎨 Frontend (Next Step)

**To complete the feature, you need:**

1. **AI Chat Widget** - Floating button (bottom-right)
2. **Admin Settings Page** - Enable/disable, set limits
3. **Admin Analytics Page** - View usage stats

**Estimated time:** 2-3 hours

**I can create these components in the next session!**

---

## 💰 Cost

**Current:** $0/month (Gemini free tier)
**Limits:** 60 requests/minute, 1,500/day
**Good for:** 100-1000 users

**If you need more:**
- Gemini paid: ~$0.50 per 1M characters
- Azure OpenAI: ~$10-30/month

---

## 🔄 Switch to Azure OpenAI (Later)

**When you're ready:**

1. Get Azure OpenAI access
2. Update `.env.local`:
   ```env
   AI_PROVIDER=azure-openai
   AZURE_OPENAI_API_KEY=your_key
   AZURE_OPENAI_ENDPOINT=your_endpoint
   AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
   ```
3. Restart server

**That's it!** No code changes needed.

---

## 📊 What You Can Do Now

### **As Admin:**
- ✅ Enable/disable AI assistant
- ✅ Set usage limits per user
- ✅ View analytics (requests, users, tokens)
- ✅ Monitor conversations
- ✅ Test AI responses

### **As User (via API):**
- ✅ Send questions to AI
- ✅ Get context-aware responses
- ✅ Check usage limits
- ✅ View remaining requests

---

## 🎉 Summary

**Backend Status:** ✅ 100% Complete
**Frontend Status:** ⏳ Pending (2-3 hours)

**You can:**
- Test AI via API right now
- Enable/disable via API
- Monitor usage via API
- Switch providers anytime

**Next session:**
- Create chat widget
- Create admin panel UI
- Full integration

---

**Questions? Just ask!** 🚀

