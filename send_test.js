const TOKEN = '8697520389:AAHI99nRPkDwew8kA-hTDZ2mNaHCC6ZpnkE';
const CHAT_ID = '7080909965';

async function sendTest() {
  console.log('🚀 Sending Test Alert...');
  try {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: '🚀 *Arc House Alert System Connected!*\n\nAapka bot ab active hai. Jab bhi naya content aaye ga, aapko foran alert mil jaye ga.',
        parse_mode: 'Markdown'
      })
    });
    const data = await response.json();
    if (data.ok) {
      console.log('✅ Test Alert Sent Successfully!');
    } else {
      console.log('❌ Failed to send alert:', data);
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

sendTest();
