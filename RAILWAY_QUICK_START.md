# Railway Quick Start - 20 Minutes to Production

**The fastest way to deploy your full-stack app**

---

## ✅ What You Need

- GitHub account
- 20 minutes

---

## 🚀 5-Step Deployment

### Step 1: Push to GitHub (5 min)

```powershell
# If you don't have a repo yet
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Sign Up for Railway (2 min)

1. Go to https://railway.app/
2. Click "Login"
3. Sign in with GitHub
4. Authorize Railway

### Step 3: Deploy Your App (5 min)

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Click "Deploy Now"

Wait 2-3 minutes for deployment...

### Step 4: Add Database (3 min)

1. In project dashboard, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Wait 30 seconds

### Step 5: Configure Variables (5 min)

1. Click on your service (not database)
2. Go to "Variables" tab
3. Click "New Variable" and add:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=change-this-to-a-long-random-string-at-least-32-characters
FRONTEND_URL=https://${{RAILWAY_STATIC_URL}}
```

4. Click "Deploy" to restart with new variables

---

## 🎉 You're Live!

1. Go to "Settings" tab
2. Under "Domains", click "Generate Domain"
3. Copy your URL (e.g., `your-app.up.railway.app`)
4. Open it in your browser!

**Default Login:**
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ Change the admin password immediately!**

---

## 📊 Your Dashboard

**View Logs:**
1. Click "Deployments"
2. Click latest deployment
3. Click "View Logs"

**Monitor Usage:**
1. Click "Usage" in sidebar
2. View current month's usage
3. You have $5 free credit/month

**Restart Service:**
1. Go to "Settings"
2. Click "Restart"

---

## 🔄 Update Your App

Just push to GitHub:
```powershell
git add .
git commit -m "Update feature"
git push
```

Railway auto-deploys in 2-3 minutes!

---

## 💰 Cost

**Free Tier:**
- $5 credit per month (renews monthly)
- 500 hours of usage
- 100GB bandwidth
- 1GB PostgreSQL storage

**Typical Usage:**
- Small app: $3-4/month ✅ Within free tier
- Medium app: $5-8/month
- Large app: $10-15/month

---

## 🆘 Troubleshooting

### Build Failed?
1. Check logs in Railway dashboard
2. Verify all files are committed to GitHub
3. Check `package.json` has `"start": "node src/server.js"`

### Can't Access App?
1. Wait 3-4 minutes after deployment
2. Check logs for errors
3. Verify domain is generated in Settings

### Database Error?
1. Make sure PostgreSQL service is running
2. Verify `DATABASE_URL` variable is set
3. Check it's linked: `${{Postgres.DATABASE_URL}}`

### Frontend Not Loading?
1. Check build logs
2. Verify `frontend/dist` folder was created
3. Check `server.js` has static file serving code

---

## ✅ Success Checklist

- [ ] App accessible via Railway URL
- [ ] Can login with admin credentials
- [ ] Can create projects, tasks, clients
- [ ] No errors in logs
- [ ] Database connected
- [ ] Admin password changed

---

## 🎯 Next Steps

1. **Add Custom Domain** (optional)
   - Go to Settings → Domains
   - Add your domain
   - Update DNS records

2. **Monitor Your App**
   - Check logs daily
   - Monitor usage in dashboard
   - Set up alerts

3. **Optimize Performance**
   - Review slow queries
   - Add database indexes
   - Enable caching

---

## 📚 Resources

- **Full Guide:** See `RAILWAY_DEPLOYMENT.md`
- **Railway Docs:** https://docs.railway.app/
- **Support:** https://discord.gg/railway

---

**That's it! Your app is live in production! 🚀**

**Questions?** Check the full guide in `RAILWAY_DEPLOYMENT.md`
