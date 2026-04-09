import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a highly professional medical AI assistant specialized in dementia, neurology, and cognitive health.
Your role is to answer questions related to dementia, its symptoms, risk factors, brain health, and the science behind cognitive decline.

STRICT RESTRICTIONS:
1. Speak ONLY in a professional, empathetic, and clinical tone.
2. DO NOT suggest "silly home remedies", alternative medicine pseudo-science, or unverified treatments.
3. If the user asks about topics entirely unrelated to health, medicine, or dementia, you MUST politely decline to answer, stating that you are a specialized medical chatbot.
4. Keep your responses concise and readable (short to medium length). Use formatting like bullet points if necessary.
5. Always remind the user that you are an AI and they should consult a certified neurologist for a formal diagnosis.`;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured in .env.local file.' }, { status: 500 });
    }

    // Format messages for Groq API (OpenAI format)
    // Convert 'model' role from frontend to 'assistant' role for backend
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Prepend the system prompt securely on the server
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...formattedMessages
    ];

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      temperature: 0.2, // keep it grounded and professional
    };

    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", data);
      return NextResponse.json({ error: data.error?.message || 'Error communicating with AI service' }, { status: response.status });
    }

    const textResponse = data.choices?.[0]?.message?.content;

    if (!textResponse) {
      return NextResponse.json({ error: 'Invalid response from AI' }, { status: 500 });
    }

    return NextResponse.json({ text: textResponse });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: 'Internal server error while processing chat' }, { status: 500 });
  }
}
