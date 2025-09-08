import { TopicCategory } from './types';

export const TOPIC_CATEGORIES: TopicCategory[] = [
    {
        name: '初級 (Beginner)',
        topics: [
            { id: 'b-greetings', title: '挨拶と基本的な表現', description: '基本的な挨拶、感謝、謝罪の表現を学びます。', level: 'Beginner' },
            { id: 'b-self-introduction', title: '自己紹介', description: '名前、国籍、簡単な職業を伝える練習をします。', level: 'Beginner' },
            { id: 'b-alphabet', title: 'キリル文字と発音', description: 'ロシア語のアルファベットを学び、基本的な発音を練習します。', level: 'Beginner' },
            { id: 'b-basic-questions', title: '簡単な質問', description: '「これは何？」「どこ？」「いつ？」など基本的な質問を学びます。', level: 'Beginner' },
            { id: 'b-shopping-basic', title: '簡単な買い物', description: '値段を尋ねたり、商品を買ったりする初歩的な会話です。', level: 'Beginner' },
            { id: 'b-ordering-food', title: 'カフェでの注文', description: '基本的な食べ物や飲み物を注文する方法を学びます。', level: 'Beginner' },
            { id: 'b-numbers-time', title: '数字と時間', description: '数字の言い方と、現在の時刻の尋ね方・答え方を練習します。', level: 'Beginner' },
            { id: 'b-family', title: '家族について', description: '自分の家族について簡単に紹介します。', level: 'Beginner' },
        ],
    },
    {
        name: '中級 (Intermediate)',
        topics: [
            { id: 'i-transport-metro', title: '地下鉄に乗る', description: '駅で行き先を尋ね、切符を買う会話を練習します。', level: 'Intermediate' },
            { id: 'i-asking-directions', title: '道を尋ねる', description: '目的地までの道順を尋ね、教えてもらいます。', level: 'Intermediate' },
            { id: 'i-at-the-market', title: '市場での買い物', description: '市場で欲しいものを伝え、重さで買う練習をします。', level: 'Intermediate' },
            { id: 'i-restaurant-requests', title: 'レストランでの会話', description: 'おすすめの料理を聞いたり、アレルギーについて伝えたりします。', level: 'Intermediate' },
            { id: 'i-hotel-checkin', title: 'ホテルでチェックイン', description: '予約の確認や部屋についての質問をします。', level: 'Intermediate' },
            { id: 'i-hobbies', title: '趣味について話す', description: '自分の趣味や休日の過ごし方について話します。', level: 'Intermediate' },
            { id: 'i-making-plans', title: '友人と計画を立てる', description: '友人と会う約束をするための会話を練習します。', level: 'Intermediate' },
            { id: 'i-weather', title: '天気について話す', description: '今日の天気や季節について話す表現を学びます。', level: 'Intermediate' },
        ],
    },
    {
        name: '上級 (Advanced)',
        topics: [
            { id: 'a-renting-apartment', title: 'アパートを借りる', description: '不動産屋で希望を伝え、賃貸契約について話します。', level: 'Advanced' },
            { id: 'a-at-the-bank', title: '銀行での手続き', description: '銀行で口座を開設したり、両替をしたりする会話です。', level: 'Advanced' },
            { id: 'a-job-interview', title: '就職の面接', description: '自分の経歴や長所をアピールする練習をします。', level: 'Advanced' },
            { id: 'a-discussing-literature', title: '文学について語る', description: '好きな作家や本について、感想を交えて話します。', level: 'Advanced' },
            { id: 'a-discussing-news', title: 'ニュースについて議論する', description: '最近のニュースについて、自分の意見を交えて話します。', level: 'Advanced' },
            { id: 'a-russian-culture', title: 'ロシアの文化について話す', description: 'ロシアの文化や習慣について、より深い会話をします。', level: 'Advanced' },
            { id: 'a-at-the-dacha', title: 'ダーチャ（別荘）にて', description: 'ロシアのダーチャ文化に関連する会話を練習します。', level: 'Advanced' },
            { id: 'a-formal-conversation', title: '丁寧な会話', description: '目上の人や初対面の人と話す際の丁寧な表現を学びます。', level: 'Advanced' },
        ],
    },
];