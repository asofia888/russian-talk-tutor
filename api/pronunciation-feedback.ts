import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { setCorsHeaders } from '../utils/cors';

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 representing the accuracy of the pronunciation. 100 is perfect."
        },
        feedback: {
            type: Type.STRING,
            description: "Encouraging and constructive feedback in Japanese. Point out one good thing and one thing to improve. Keep it concise."
        },
        is_correct: {
            type: Type.BOOLEAN,
            description: "A simple boolean indicating if the user's pronunciation was generally correct and understandable."
        }
    },
    required: ["score", "feedback", "is_correct"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    setCorsHeaders(res, req.headers.origin);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { transcript, correctPhrase } = req.body;

        if (!transcript || typeof transcript !== 'string') {
            return res.status(400).json({ error: 'Transcript is required and must be a string' });
        }

        if (!correctPhrase || typeof correctPhrase !== 'string') {
            return res.status(400).json({ error: 'Correct phrase is required and must be a string' });
        }

        const apiKey = process.env['GEMINI_API_KEY'];
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            return res.status(500).json({
                error: 'Server configuration error: GEMINI_API_KEY is not configured',
                hint: 'Please set the GEMINI_API_KEY environment variable in Vercel dashboard'
            });
        }

        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-flash-latest";

        const response = await ai.models.generateContent({
            model: model,
            contents: `The user said: "${transcript}". The correct phrase is: "${correctPhrase}".`,
            config: {
                systemInstruction: "あなたは、ロシア語教師です。生徒の発音練習を評価します。生徒の発言（音声認識されたテキスト）と、正しいお手本のフレーズを比較してください。比較に基づき、以下のJSONスキーマに従って評価を返してください。\n\n- 評価は厳しすぎず、生徒がやる気をなくさないように、励ますことを重視してください。\n- フィードバックは日本語で、簡潔に、良かった点と改善点を1つずつ指摘してください。\n- `is_correct`は、多少の間違いがあっても意味が通じるレベルであれば`true`にしてください。",
                responseMimeType: "application/json",
                responseSchema: feedbackSchema,
            },
        });

        const jsonText = response.text?.trim();
        if (!jsonText) {
            throw new Error('Empty response from AI');
        }

        const feedback = JSON.parse(jsonText);
        if (!feedback || typeof feedback.score !== 'number' || typeof feedback.feedback !== 'string') {
            throw new Error('Invalid feedback data');
        }

        return res.status(200).json(feedback);
    } catch (error: any) {
        console.error('Error generating feedback:', error);

        if (error?.status === 429) {
            return res.status(429).json({ error: 'API rate limit exceeded' });
        }

        if (error?.status === 401) {
            return res.status(500).json({ error: 'API authentication error' });
        }

        return res.status(500).json({
            error: 'Failed to generate feedback',
            details: error.message
        });
    }
}
