const headers = { "Content-Type": "application/json" };

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST." }), { status: 405, headers });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "A IA ainda não foi configurada." }), { status: 503, headers });
  }

  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 1200) {
      return new Response(JSON.stringify({ error: "Digite uma pergunta de até 1200 caracteres." }), { status: 400, headers });
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "Você é a Tyrion AI, assistente da Tyrion Tech. Responda em português brasileiro, de forma clara e útil." }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 700 }
      })
    });
    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Erro no serviço de IA. Confira a configuração da API." }), { status: 502, headers });
    }
    const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("\n").trim();
    if (!reply) throw new Error("Sem resposta");
    return new Response(JSON.stringify({ reply }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: "Não consegui conectar à IA. Tente novamente." }), { status: 502, headers });
  }
};
