# 🚀 Arc House Alert System

A production-ready automated monitoring system for Arc House content updates. Detects new articles, blogs, events, and resources, sending instant alerts to your Telegram.

## ✨ Features

- **Automated Monitoring:** Scrapes Arc House every few minutes for new content.
- **Telegram Integration:** Instant alerts with titles, links, and tags.
- **Smart Deduplication:** Never receive the same alert twice.
- **Modern Dashboard:** Premium dark-mode UI to track detections and system health.
- **Vercel Ready:** Fully compatible with Vercel Cron Jobs and Serverless functions.

## 🛠 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **Scraping:** Cheerio
- **Database:** Vercel KV (Redis)
- **Notifications:** Telegram Bot API

## 🚀 Setup Guide

### 1. Telegram Bot Setup
1. Message [@BotFather](https://t.me/botfather) on Telegram.
2. Create a new bot and copy the **API Token**.
3. To get your **Chat ID**:
   - For Private Chat: Message [@userinfobot](https://t.me/userinfobot).
   - For Channel: Add your bot as an admin, send a message, and use `https://api.telegram.org/bot<TOKEN>/getUpdates` to find the channel ID.

### 2. Deployment on Vercel
1. Push this code to a GitHub repository.
2. Import the project to [Vercel](https://vercel.com).
3. **Storage:** Go to the "Storage" tab in Vercel and create a **KV (Redis)** database. Connect it to your project.
4. **Environment Variables:** Add the following to Vercel:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
5. **Cron Jobs:** The system uses `vercel.json` to schedule checks. Note: Vercel Hobby tier supports 1 cron run per day. For more frequent checks, use a service like [Cron-job.org](https://cron-job.org) to ping your `/api/check` endpoint.

### 3. Local Development
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to see the dashboard.

## 📁 Project Structure

- `/app/api/check`: Scraper trigger point (Cron).
- `/app/api/stats`: Dashboard data provider.
- `/lib/scraper.ts`: HTML parsing logic for Arc House.
- `/lib/telegram.ts`: Bot notification utility.
- `/lib/storage.ts`: Redis state management.

## 🛡 License
MIT
