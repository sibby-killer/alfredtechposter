# How to Set Up Your Free Google Sheets CRM 📊

To collect all your website leads into a free database, follow these rapid steps to create a Google Apps Script Webhook.

## Step 1: Prepare the Google Sheet
1. Open [Google Sheets](https://sheets.google.com/) and create a new blank spreadsheet.
2. Name it **Alfred Tech CRM**.
3. In row 1, add these exact headers in columns A through F:
   * **A1:** `Timestamp`
   * **B1:** `Name`
   * **C1:** `Business`
   * **D1:** `Service`
   * **E1:** `Budget`
   * **F1:** `Description`
4. Freeze the top row so it's always visible (`View` > `Freeze` > `1 Row`).

## Step 2: Add the Magic Script
1. In the menu bar, click `Extensions` > `Apps Script`.
2. Delete any code in the editor and paste the following:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Add the row
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.business || "",
      data.service || "",
      data.budget || "",
      data.description || ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 3: Deploy the Webhook
1. Click the blue **Deploy** button at the top right, then select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Under "Description", type `Alfred CRM v1`.
4. Under "Execute as", make sure it says **Me (your email)**.
5. Under "Who has access", change it to **Anyone**. *(Important!)*
6. Click **Deploy**.
7. Google will prompt a scary warning asking for "Authorization". Click **Review permissions** -> Choose your account -> Click **Advanced** -> Click **Go to Untitled project (unsafe)** -> Click **Allow**.
8. You will receive a long URL starting with `https://script.google.com/macros/s/.../exec`. 
9. **Copy this URL!**

## Step 4: Paste into Your Code
1. Open the file `docs/landing.js` in your repository.
2. Look at the top of the file, line 4:
   `const GOOGLE_SHEETS_WEBHOOK_URL = "";`
3. Paste the URL inside the quotes.
   Example: `const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfyc.../exec";`
4. Save the file and push to GitHub!

Now, every time a client submits a quote on the Landing Page, you will receive a WhatsApp message AND they will be perfectly logged in your Google Sheet!
