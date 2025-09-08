
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ConversationLine, Feedback } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

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

export const generateConversation = async (topic: string): Promise<ConversationLine[]> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: `トピック: 「${topic}」`,
            config: {
                systemInstruction: "あなたは、ロシア語学習コンテンツのクリエイターです。指定されたトピックとJSONスキーマに基づいて、ロシア語初心者の日本人学習者向けの、自然で実用的な会話文を生成するのがあなたの役割です。会話は二人の話者間で行い、トピックの難易度に応じて語彙や文の複雑さを調整してください。発音表記は、学習者が読みやすいように一般的なローマ字表記を使用してください。話者は「A」「B」のようにシンプルな名前にしてください。さらに、もしセリフの中に日本人学習者にとって重要だと思われる文法事項（例：動詞の体、運動の動詞など）が含まれている場合は、そのセリフの'grammarPoint'オブジェクトに解説を追加してください。加えて、文中の名詞や代名詞が主格以外の形（格変化）で使われている場合、その単語の'words'オブジェクトに'baseForm'（基本形）と'caseInfo'（格の詳細情報）を追加してください。'caseInfo'には、格の名称、なぜその格が使われるかの簡単な説明、そして単数形と複数形の完全な格変化表を含めてください。これらの追加情報は学習価値が高いと判断した場合にのみ生成し、すべての単語やセリフに含める必要はありません。出力は提供されたJSONスキーマに厳密に従ってください。",
                responseMimeType: "application/json",
                responseSchema: conversationSchema,
            },
        });

        const jsonText = response.text.trim();
        const conversation = JSON.parse(jsonText);
        return conversation as ConversationLine[];
    } catch (error) {
        console.error("Error generating conversation:", error);
        throw new Error("AIとの会話生成に失敗しました。");
    }
};

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

export const getPronunciationFeedback = async (transcript: string, correctPhrase: string): Promise<Feedback> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: `The user said: "${transcript}". The correct phrase is: "${correctPhrase}".`,
            config: {
                systemInstruction: "あなたは、ロシア語教師です。生徒の発音練習を評価します。生徒の発言（音声認識されたテキスト）と、正しいお手本のフレーズを比較してください。比較に基づき、以下のJSONスキーマに従って評価を返してください。\n\n- 評価は厳しすぎず、生徒がやる気をなくさないように、励ますことを重視してください。\n- フィードバックは日本語で、簡潔に、良かった点と改善点を1つずつ指摘してください。\n- `is_correct`は、多少の間違いがあっても意味が通じるレベルであれば`true`にしてください。",
                responseMimeType: "application/json",
                responseSchema: feedbackSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const feedback = JSON.parse(jsonText);
        return feedback as Feedback;

    } catch (error) {
        console.error("Error generating pronunciation feedback:", error);
        // Re-throw a user-friendly error message for the UI to handle.
        throw new Error("フィードバックの取得に失敗しました。ネットワーク接続を確認するか、後でもう一度お試しください。");
    }
};