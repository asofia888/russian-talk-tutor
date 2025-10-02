
import { useState, useEffect } from 'react';

const tips = [
    'ロシア語の挨拶「Здравствуйте (zdrastvuyte)」は、フォーマルな場面で使える丁寧な言葉です。親しい間柄では「Привет (privet)」を使います。',
    'ロシア語のアルファベットは「キリル文字」と呼ばれ、33文字からなります。',
    'ロシアでは、家に入るときに敷居を踏むのは縁起が悪いとされています。また、室内で口笛を吹くとお金がなくなるとも言われています。',
    '世界的に有名な人形「マトリョーシカ」は、19世紀末にロシアで生まれました。',
    '広大なロシアには11ものタイムゾーンがあります。',
    '「Да (da)」は「はい」、「Нет (net)」は「いいえ」を意味する基本的な単語です。',
    'ロシアの伝統的なスープ「ボルシチ」は、ビーツを主材料とした鮮やかな赤色が特徴です。',
];

const LoadingTips = () => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex(prevIndex => (prevIndex + 1) % tips.length);
        }, 4500); // Change tip every 4.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-blue-700 mb-3">ロシアの豆知識 💡</h3>
            <div
                key={currentTipIndex} // Add key to re-trigger animation
                className="text-slate-600 leading-relaxed animate-fade-in min-h-[48px]"
                aria-live="polite"
            >
                {tips[currentTipIndex]}
            </div>
             <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
            `}</style>
        </div>
    );
};

export default LoadingTips;