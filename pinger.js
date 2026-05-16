const URL = 'https://detect-brown.vercel.app/api/check';
const INTERVAL = 10 * 60 * 1000; // 10 minutes

async function ping() {
  const now = new Date().toLocaleTimeString();
  console.log(`[${now}] 🔍 Checking for new Arc House content...`);
  try {
    const res = await fetch(URL);
    const data = await res.json();
    console.log(`[${now}] ✅ Response:`, data);
  } catch (err) {
    console.error(`[${now}] ❌ Error pinging:`, err.message);
  }
}

// Initial ping
ping();

// Schedule every 10 minutes
setInterval(ping, INTERVAL);

console.log('🚀 Arc Alert Pinger is running in background. Do not close this terminal.');
