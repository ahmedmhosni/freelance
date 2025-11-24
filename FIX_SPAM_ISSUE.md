# 📧 Fix Emails Going to Spam

## Why Emails Go to Spam

Your emails are going to spam because:
1. **New domain** - Azure subdomain has no reputation yet
2. **No SPF/DKIM** - Azure Managed Domain doesn't have custom DNS records
3. **Low volume** - Gmail/Outlook don't trust new senders

## ✅ Quick Fixes (Do These Now)

### 1. Mark as "Not Spam" (Immediate)
**You need to do this:**
1. Open the email in your spam folder
2. Click **"Not Spam"** or **"Report Not Spam"**
3. Move it to inbox

**Why this helps:**
- Trains Gmail/Outlook that these emails are legitimate
- Future emails more likely to go to inbox
- Improves sender reputation

### 2. Add to Contacts (Immediate)
1. Add `DoNotReply@966a35d1-949d-4783-9986-0ecc6eadc778.azurecomm.net` to your contacts
2. This tells Gmail/Outlook you trust this sender

### 3. Warm Up Your Domain (1-2 weeks)
**Start slow:**
- Week 1: Send 10-20 emails/day
- Week 2: Send 50-100 emails/day
- Week 3: Send 200+ emails/day

**Why:** Email providers trust senders who gradually increase volume.

---

## 🚀 Long-term Solutions

### Option 1: Use Custom Domain (Best Solution)

Switch to `donotreply@roastify.online` - this will significantly improve deliverability.

**Benefits:**
- Professional appearance
- Better reputation
- SPF/DKIM/DMARC records
- Higher trust from email providers

**Setup time:** 2-4 hours (including DNS propagation)

See: `CUSTOM_DOMAIN_EMAIL_SETUP.md`

---

### Option 2: Improve Email Content

**Current issues that trigger spam filters:**

1. **Too many links** - Verification emails have multiple links
2. **Generic sender** - "DoNotReply" looks automated
3. **No unsubscribe** - Transactional emails should have footer

**Fixes:**

#### A. Add Unsubscribe Footer
Even though these are transactional emails, adding a footer helps:

```html
<p style="font-size: 11px; color: #999; margin-top: 30px;">
  This is a transactional email. You received this because you registered at Roastify.
  <br>
  Questions? Contact us at support@roastify.com
</p>
```

#### B. Reduce Links
- Use one clear CTA button
- Remove redundant text links
- Keep it simple

#### C. Improve Subject Lines
**Bad:**
- "Verify your Roastify account" (generic)

**Good:**
- "Welcome! Verify your email to get started"
- "Your Roastify verification code"

---

### Option 3: Use Email Authentication

**Add these to improve trust:**

#### SPF Record (if using custom domain)
```
Type: TXT
Host: @
Value: v=spf1 include:_spf.azurecomm.net -all
```

#### DMARC Record (if using custom domain)
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@roastify.com
```

**Note:** These only work with custom domain, not Azure subdomain.

---

## 📊 Monitor Email Deliverability

### Check Your Sender Score

1. **Mail Tester** - https://www.mail-tester.com/
   - Send test email to their address
   - Get score out of 10
   - See what's wrong

2. **Google Postmaster Tools** - https://postmaster.google.com/
   - Monitor Gmail delivery
   - See spam rate
   - Track reputation

3. **Azure Portal**
   - Communication Services → Email → Insights
   - See delivery rates
   - Monitor bounces

---

## 🎯 Expected Timeline

### Immediate (Today)
- Mark emails as "Not Spam"
- Add sender to contacts
- ✅ Emails should go to inbox for you

### Short-term (1-2 weeks)
- Send emails regularly
- Build sender reputation
- ✅ Deliverability improves to 70-80%

### Long-term (1-2 months)
- Switch to custom domain
- Add SPF/DKIM/DMARC
- Build strong reputation
- ✅ Deliverability improves to 95%+

---

## 💡 Best Practices

### Do's ✅
- Send from consistent address
- Keep email content clean
- Include contact information
- Send regularly (not in bursts)
- Monitor bounce rates
- Respond to replies (if possible)

### Don'ts ❌
- Don't use ALL CAPS in subject
- Don't use spam trigger words ("FREE", "URGENT", "ACT NOW")
- Don't send too many emails at once
- Don't use URL shorteners
- Don't send from different addresses
- Don't ignore bounces

---

## 🧪 Test Your Emails

### Before Sending to Users:

1. **Send to yourself** - Check spam folder
2. **Send to different providers** - Gmail, Outlook, Yahoo
3. **Check on mobile** - iOS Mail, Android Gmail
4. **Use Mail Tester** - Get score and fix issues
5. **Review content** - Remove spam triggers

---

## 🆘 Still Going to Spam?

### Checklist:

- [ ] Marked as "Not Spam" in Gmail/Outlook
- [ ] Added sender to contacts
- [ ] Sending regularly (not just once)
- [ ] Email content is clean (no spam words)
- [ ] Using professional sender name
- [ ] Including contact information
- [ ] Monitoring Azure insights

### If still having issues:

1. **Switch to custom domain** - This is the #1 fix
2. **Contact Azure Support** - They can check your sender reputation
3. **Use a different email service** - SendGrid, Mailgun, etc.

---

## 📈 Success Metrics

**Good deliverability:**
- Inbox rate: 95%+
- Spam rate: <5%
- Bounce rate: <2%
- Open rate: 20-30% (for transactional emails)

**Check these in:**
- Azure Portal → Communication Services → Insights
- Google Postmaster Tools
- Your own testing

---

## 🎉 Summary

**Right now:**
1. Mark test emails as "Not Spam" ✅
2. Add sender to contacts ✅
3. Start sending emails regularly

**Next week:**
1. Monitor deliverability
2. Adjust email content if needed
3. Consider custom domain

**Next month:**
1. Switch to custom domain (roastify.online)
2. Add SPF/DKIM/DMARC
3. Achieve 95%+ inbox rate

---

**The spam issue is normal for new senders and will improve over time!** 🚀
