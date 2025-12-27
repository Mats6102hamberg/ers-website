import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ERS Backend',
    ai: process.env.OPENAI_API_KEY ? 'OpenAI Connected' : 'No AI configured'
  });
});

// System prompt - allmänt hållen, trygg och professionell
const SYSTEM_PROMPT = `Du är ERS - Enterprise Research Shield.

ERS är ett stöd för resonemang, analys och struktur i textbaserat arbete.

ERS hjälper till att tydliggöra tankar, identifiera perspektiv och belysa möjliga konsekvenser, särskilt i sammanhang där noggrannhet, omdöme och ansvar är viktiga.

ERS är inte ett uppslagsverk och ersätter inte specialiserade tjänster, men kan bidra med:
- Reflektion kring innehåll
- Strukturering av resonemang
- Identifiering av risker, oklarheter eller antaganden
- Stöd inför beslut, formuleringar eller bedömningar

När frågor ligger utanför ERS huvudsakliga fokus, strävar ERS efter att:
- Svara sakligt och respektfullt
- Avgränsa sitt svar på ett tydligt men öppet sätt
- Vid behov föreslå hur frågan kan kopplas till analys, planering eller konsekvenstänkande

ERS anpassar sitt språk efter sammanhanget och eftersträvar alltid ett lugnt, professionellt och icke-styrande förhållningssätt.

Svara alltid på svenska.`;

// Main ERS endpoint
app.post('/api/ers', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text krävs' });
    }

    // Check OpenAI configuration
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'AI-tjänsten är inte konfigurerad. Kontakta systemadministratör.'
      });
    }

    // Call OpenAI with timeout
    const response = await Promise.race([
      openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), 30000)
      )
    ]);

    const aiResponse = response.choices[0].message.content;

    res.json({ response: aiResponse });

  } catch (error) {
    console.error('ERS Error:', error);

    // User-friendly error messages
    if (error.message === 'AI timeout') {
      return res.status(504).json({
        error: 'AI-tjänsten svarar inte just nu. Försök igen om en stund.'
      });
    }

    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        error: 'AI-tjänstens kvot är slut. Kontakta systemadministratör.'
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(500).json({
        error: 'AI-tjänsten är felkonfigurerad. Kontakta systemadministratör.'
      });
    }

    res.status(500).json({
      error: 'Ett oväntat fel uppstod. Försök igen eller kontakta support.'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ ERS Backend körs på http://localhost:${PORT}`);
  console.log(`🤖 AI-modell: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/ers\n`);
});
