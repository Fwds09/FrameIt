import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Gemini image description will be disabled.');
}

const client = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const MODEL_NAME = 'gemini-2.5-flash';

export async function generateImageDescriptionFromBuffer(buffer, mimeType) {
  if (!client) {
    throw new Error('Gemini client is not configured. Missing GEMINI_API_KEY.');
  }

  try {
    const base64Data = buffer.toString('base64');

    const model = client.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Given this image, generate a concise, friendly description in 3–4 lines suitable as an image caption.' },
            {
              inlineData: {
                data: base64Data,
                mimeType
              }
            }
          ]
        }
      ]
    });

    const responseText = typeof result.response.text === 'function'
      ? result.response.text()
      : result.response.text;

    if (!responseText || typeof responseText !== 'string') {
      throw new Error('No description returned from Gemini.');
    }

    return responseText.trim();
  } catch (error) {
    console.error('Gemini generateImageDescriptionFromBuffer error:', error);
    throw new Error('Failed to generate image description.');
  }
}


