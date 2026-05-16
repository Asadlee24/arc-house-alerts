const TOKEN = '8697520389:AAHI99nRPkDwew8kA-hTDZ2mNaHCC6ZpnkE';

async function getChatId() {
  console.log('🔄 Checking for messages to the bot...');
  try {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
    const data = await response.json();
    
    if (data.result && data.result.length > 0) {
      const lastMessage = data.result[data.result.length - 1];
      const chatId = lastMessage.message.chat.id;
      const username = lastMessage.message.from.first_name;
      console.log(`✅ Found Chat ID: ${chatId} (from ${username})`);
      return chatId;
    } else {
      console.log('⏳ No messages found yet. Please send a message to @arcdetectbot');
      return null;
    }
  } catch (err) {
    console.error('❌ Error fetching updates:', err);
    return null;
  }
}

getChatId();
