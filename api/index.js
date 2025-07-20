export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Respuesta preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST allowed' });
  }

  const { message, lang = 'es' } = req.body;

  const systemPrompt = {
    es: "Eres GlowyBot 🌸, una influencer coreana de K-beauty. Hablas español con cercanía y encanto. Recomiendas productos, rutinas y tips de cuidado facial según el tipo de piel. Sé divertida, cercana y profesional.",
    en: "You are GlowyBot 🌸, a Korean K-beauty influencer. You speak with charm and friendliness. Recommend products, routines and skincare tips based on skin type. Be fun, relatable, and professional.",
    fr: "Tu es GlowyBot 🌸, une influenceuse coréenne de K-beauty. Tu parles avec charme et proximité. Tu recommandes des produits, des routines et des astuces en fonction du type de peau. Sois drôle, accessible et experte."
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt[lang] || systemPrompt['es'] },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Lo siento, no tengo respuesta.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("Error al contactar OpenAI:", err);
    res.status(500).json({ error: "Error al conectarse con OpenAI" });
  }
}
