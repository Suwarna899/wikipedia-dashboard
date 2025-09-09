# 📚 Wikipedia Dashboard 

A dynamic, single-page React application that delivers deep insights into any Wikipedia article. Users can input a page title (e.g., "Albert Einstein") and instantly view detailed statistics, metadata, content, and engagement metrics — all fetched via the [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page).

> 🔗 **Live Demo**: [https://suwarna899.github.io/wikipedia-dashboard](https://suwarna899.github.io/wikipedia-dashboard)

---

## ⚙️ Tech Stack

- ⚛️ React
- 🎨 CSS (custom styling)
- 📡 MediaWiki API
- 📊 Chart.js or Recharts (for data visualization)
- 🚀 GitHub Pages (for deployment)

---

## 🚀 Features

### 🧩 Core Page Info
- ✅ Page Title
- ✅ Page ID
- ✅ Page Length (in bytes)

### ✏️ Edit History & Page Status
- ✅ Last Edited Date
- ✅ Current Revision ID
- ✅ Page Creation Date (via first revision)
- ✅ Page Protection Status

### 🧠 Content & Connectivity
- ✅ Introductory Paragraph / Summary
- ✅ Main Image / Thumbnail
- ✅ Scrollable list of:
  - Pages it links to
  - Pages that link to it (backlinks)

### 📈 Engagement Metrics
- ✅ Total views over last N days
- ✅ Daily views (chart for last 30 days)
- ✅ Average daily views
- ✅ Total number of unique editors
- ✅ Username of last editor
- ✅ Number of languages the page is available in
  
### ⛳️ Challenges Encountered And Solutions
    Challenges Encountered & Solutions

    ⛳️Concurrent Data Fetching:
    Challenge: Coordinating multiple API calls simultaneously without blocking the UI.
    Solution: Used Promise.all to run requests in parallel and implemented robust error handling to ensure partial failures didn’t break the app.

    ⛳️Complex API Responses:
    Challenge: Parsing deeply nested and inconsistent MediaWiki data.
    Solution: Created utility functions to normalize data and handle edge cases, ensuring reliable data structures for the UI.

    ⛳️State Management:
    Challenge: Managing loading, success, and error states to keep the UI clear and responsive.
    Solution: Designed a predictable state structure with React hooks, showing spinners and user-friendly messages during loading and errors.

    ⛳️Handling Large Data Sets:
    Challenge: Pages with hundreds of links/backlinks could overwhelm the UI.
    Solution: Implemented pagination and scrollable containers to load and display data efficiently without freezing the interface.

    ⛳️Data Visualization:
    Challenge: Displaying page view trends clearly and responsively.
    Solution: Integrated a charting library (e.g., Recharts) and transformed raw data into interactive, mobile-friendly graphs.

    ⛳️CORS & Rate Limits:
    Challenge: Dealing with API restrictions and occasional failures.
    Solution: Added origin=* in API requests to avoid CORS issues and added retry logic to handle rate limiting gracefully. 

---

## 🛠️ Getting Started

### 1.Repository

```bash
git clone https://github.com/Suwarna899/wikipedia-dashboard.git
cd wikipedia-dashboard
2.📦 Dependencies

Here are the main dependencies used:

- **React** – for building the UI
- **Axios** – for fetching data from the MediaWiki API
- **Chart.js** – for visualizing daily views
- **gh-pages** – for deployment to GitHub Pages


3.**Deployment**
-Install gh-pages as a dev dependency
npm install gh-pages --save-dev
-Add homepage to package.json
"homepage": "https://s_suwarna.github.io/your-repo-name"
Add deploy scripts to package.json
-"scripts": 
{
  "start": "react-scripts start",
  "build": "react-scripts build",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

Deployedto: https://s_suwanra.github.io/wikipedia-dashboard

📜 License
MIT
