import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const declensionSchema = {
    type: Type.OBJECT,
    properties: {
        nominative: { type: Type.STRING },
        genitive: { type: Type.STRING },
        dative: { type: Type.STRING },
        accusative: { type: Type.STRING },
        instrumental: { type: Type.STRING },
        prepositional: { type: Type.STRING },
    },
    required: ["nominative", "genitive", "dative", "accusative", "instrumental", "prepositional"],
};

const conversationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            speaker: { type: Type.STRING, description: "話者名 (例: A, B, 店員)" },
            russian: { type: Type.STRING, description: "ロシア語のセリフ" },
            pronunciation: { type: Type.STRING, description: "ローマ字発音表記" },
            japanese: { type: Type.STRING, description: "日本語訳" },
            words: {
                type: Type.ARRAY,
                description: "セリフを構成する単語のリスト",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        russian: { type: Type.STRING, description: "単語のロシア語表記（文中での形）" },
                        pronunciation: { type: Type.STRING, description: "単語のローマ字発音表記" },
                        japanese: { type: Type.STRING, description: "単語の日本語訳" },
                        baseForm: { type: Type.STRING, description: "単語の基本形（主格）。格変化している場合のみ生成。" },
                        caseInfo: {
                            type: Type.OBJECT,
                            description: "名詞や代名詞が格変化している場合に、その詳細情報を提供する。学習価値が高いと判断した場合のみ生成。",
                            properties: {
                                caseName: { type: Type.STRING, description: "格の英語名 (Nominative, Genitive, etc.)" },
                                caseNameJapanese: { type: Type.STRING, description: "格の日本語名 (主格, 生格, etc.)" },
                                explanation: { type: Type.STRING, description: "この文脈でなぜこの格が使われるかの簡単な日本語での説明。" },
                                declensionTable: {
                                    type: Type.OBJECT,
                                    description: "単数形と複数形の格変化の全表",
                                    properties: {
                                        singular: declensionSchema,
                                        plural: declensionSchema,
                                    },
                                    required: ["singular", "plural"],
                                }
                            },
                            required: ["caseName", "caseNameJapanese", "explanation", "declensionTable"],
                        }
                    },
                    required: ["russian", "pronunciation", "japanese"],
                },
            },
            grammarPoint: {
                type: Type.OBJECT,
                description: "このセリフに含まれる重要な文法ポイントの解説。該当する場合のみ生成する。",
                properties: {
                    title: { type: Type.STRING, description: "文法ポイントのタイトル（例：動詞の完了体と不完了体）" },
                    explanation: { type: Type.STRING, description: "文法ルールの分かりやすい解説" },
                    examples: {
                        type: Type.ARRAY,
                        description: "文法を使った例文のリスト",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                russian: { type: Type.STRING, description: "例文のロシア語表記" },
                                pronunciation: { type: Type.STRING, description: "例文のローマ字発音表記" },
                                japanese: { type: Type.STRING, description: "例文の日本語訳" },
                            },
                            required: ["russian", "pronunciation", "japanese"],
                        }
                    }
                },
                required: ["title", "explanation", "examples"]
            }
        },
        required: ["speaker", "russian", "pronunciation", "japanese", "words"],
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { topic } = req.body;

        if (!topic || typeof topic !== 'string') {
            return res.status(400).json({ error: 'Topic is required and must be a string' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-2.5-flash";

        const response = await ai.models.generateContent({
            model: model,
            contents: `トピック: 「${topic}」`,
            config: {
                systemInstruction: "あなたは、ロシア語学習コンテンツのクリエイターです。指定されたトピックとJSONスキーマに基づいて、ロシア語初心者の日本人学習者向けの、自然で実用的な会話文を生成するのがあなたの役割です。会話は二人の話者間で行い、トピックの難易度に応じて語彙や文の複雑さを調整してください。発音表記は、学習者が読みやすいように一般的なローマ字表記を使用してください。話者は「A」「B」のようにシンプルな名前にしてください。さらに、もしセリフの中に日本人学習者にとって重要だと思われる文法事項（例：動詞の体、運動の動詞など）が含まれている場合は、そのセリフの'grammarPoint'オブジェクトに解説を追加してください。加えて、文中の名詞や代名詞が主格以外の形（格変化）で使われている場合、その単語の'words'オブジェクトに'baseForm'（基本形）と'caseInfo'（格の詳細情報）を追加してください。'caseInfo'には、格の名称、なぜその格が使われるかの簡単な説明、そして単数形と複数形の完全な格変化表を含めてください。これらの追加情報は学習価値が高いと判断した場合にのみ生成し、すべての単語やセリフに含める必要はありません。出力は提供されたJSONスキーマに厳密に従ってください。",
                responseMimeType: "application/json",
                responseSchema: conversationSchema,
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error('Empty response from AI');
        }

        const conversation = JSON.parse(jsonText);
        if (!Array.isArray(conversation) || conversation.length === 0) {
            throw new Error('Invalid conversation data');
        }

        return res.status(200).json(conversation);
    } catch (error: any) {
        console.error('Error generating conversation:', error);

        if (error?.status === 429) {
            return res.status(429).json({ error: 'API rate limit exceeded' });
        }

        if (error?.status === 401) {
            return res.status(500).json({ error: 'API authentication error' });
        }

        return res.status(500).json({
            error: 'Failed to generate conversation',
            details: error.message
        });
    }
}
