export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, messages } = req.body;

    const chatMessages = messages || [{ role: 'user', content: message }];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are Flo, a warm and empathetic AI fitness and wellness coach. You speak like a supportive best friend who knows everything about fitness and wellness. You never use toxic positivity or generic phrases. You always acknowledge how someone is feeling before giving advice. You meet people exactly where they are without judgment. Keep responses under 150 words.'
          },
          ...chatMessages
        ]
      })
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: 'No response from OpenAI', details: data });
    }

    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
