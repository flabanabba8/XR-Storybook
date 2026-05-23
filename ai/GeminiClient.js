// Gemini REST API client — no npm dependencies, just fetch

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-1.5-flash';

export class GeminiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generate(prompt, options = {}) {
    const {
      temperature = 0.9,
      maxTokens = 8192
    } = options;

    const url = `${API_BASE}/${MODEL}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error.substring(0, 150)}`);
    }

    const data = await response.json();

    // Check for errors in response body
    if (data.error) {
      throw new Error(`API error: ${data.error.message || JSON.stringify(data.error).substring(0, 150)}`);
    }

    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      throw new Error('Response filtered by safety. Try a different theme.');
    }

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    // Extract JSON from response (may be wrapped in markdown or have extra text)
    text = text.trim();

    // Strip markdown code blocks
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Find JSON object/array boundaries if there's surrounding text
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }

    return text;
  }
}
