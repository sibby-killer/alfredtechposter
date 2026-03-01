# Facebook API Post Visibility Troubleshooting

During the development of the Alfred Tech Solutions auto-poster, we encountered a critical visibility issue where Facebook Posts generated strictly through the Graph API were not displaying on the main Facebook Page timeline. Below are the problems and the definitive fixes for these issues.

---

## 🛑 Problem 1: Posts Are Published But Invisible on the Main Feed
**Symptom:** The Node.js automation script logs a success message (e.g., `{"id": "XXXXXX"}`), but the posts are completely missing from the Page timeline.
**Diagnosis:** The `.env` file contains a **User Access Token** instead of a **Page Access Token**. When you post via the Graph API using a User Token, the system treats it as *you* (the human) posting a "Visitor Post" on the Page's wall, which restricts its visibility instead of posting organically as the business.

### ✅ Solution: Extract the Hidden Page Access Token via API
The Meta Developer Dashboard has a known bug where selecting the Page in the dropdown fails to generate a Page Token and repeatedly returns the User Token.

**To forcefully extract the true Page Token:**
1. In the [Graph API Explorer](https://developers.facebook.com/tools/explorer/), click **Generate Access Token** to get a standard User Token.
2. Copy that User Token to your clipboard.
3. Open a new web browser tab and paste this exact API endpoint:
   `https://graph.facebook.com/me/accounts?access_token=PASTE_YOUR_USER_TOKEN_HERE`
4. The browser will return raw JSON. Locate the `"name": "Your Page Name"` block.
5. In that same block, copy the long string next to `"access_token"`. **This is your permanent Page Token.**
6. Update the `.env` variable `FB_PAGE_ACCESS_TOKEN` with this extracted key.

---

## 🛑 Problem 2: OAuthException 190 "Session Has Expired"
**Symptom:** The script successfully posts a few times but suddenly fails an hour later with `Error validating access token: Session has expired`.
**Diagnosis:** The token generated from the Graph API Explorer is incredibly short-lived (exactly 1 hour) and expires automatically. 

### ✅ Solution: Extend the Token to a Long-Lived Token
An automation pipeline cannot use a short-lived token. You must permanently extend it.
1. Obtain the short-lived User Token from the Graph API Explorer.
2. Go to the **[Access Token Debugger Tool](https://developers.facebook.com/tools/accesstoken/)**.
3. Under your User Token row, click the **Extend** button.
4. Facebook will instantly generate a new 60-day Long-Lived User Token.
5. Take this Long-Lived User Token and run it through the `/me/accounts` trick detailed in **Solution 1** to convert it into a **Non-Expiring Page Token**.

---

## 🛑 Problem 3: Development Mode Restrictions
**Symptom:** Posts are confirmed "Published" and have the correct Page identity, but they are still invisible to random internet visitors or secondary accounts.
**Diagnosis:** The Meta App is stuck in "Development Mode" (the sandbox environment). Anything published by an app in development mode is 100% hidden from the public.

### ✅ Solution: Switch App to "Live Mode"
1. Go to the **App Dashboard** -> **App Settings** -> **Basic**.
2. To go Live, you must provide a Privacy Policy. If a GitHub URL yields an "Invalid URL" scraping error, use a [Free Privacy Policy Generator](https://www.privacypolicies.com/) to bypass the scraper.
3. Paste the generated URL into the **Privacy Policy URL** box and hit Save.
4. Click the toggle switch at the top of the dashboard to change **App Mode** from **Development** to **Live**.

---

### Security Note
Remember that after updating tokens in the local `.env` file, you must **always** update the exact same credentials in your **GitHub Repository Settings > Secrets and Variables** so that your scheduled cron jobs use the functional keys.
