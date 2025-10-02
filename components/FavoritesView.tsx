
import { useMemo } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import Flashcard from './Flashcard';
import LearnedWordListItem from './LearnedWordListItem';
import StarIcon from './icons/StarIcon';
import { Link } from 'react-router-dom';

const FavoritesView = () => {
    const { favorites } = useFavorites();

    const [reviewQueue, allWords] = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const queue = favorites
            .filter(f => new Date(f.nextReviewDate) <= today)
            .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());

        return [queue, favorites];
    }, [favorites]);

    if (favorites.length === 0) {
        return (
            <div className="text-center p-10 bg-white rounded-lg shadow-md">
                <StarIcon className="mx-auto h-16 w-16 text-slate-300" />
                <h2 className="mt-4 text-2xl font-bold text-slate-700">単語帳は空です</h2>
                <p className="mt-2 text-slate-500">会話の中から星マークをタップして、単語をお気に入りに追加しましょう。</p>
                <Link to="/" className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    会話トピックを探す
                </Link>
            </div>
        );
    }

    const firstWord = reviewQueue[0];
    if (!firstWord) {
        return null;
    }

    return (
        <div className="space-y-12">
            <section>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">単語レビュー</h1>
                <p className="text-slate-600 mb-6">間隔反復システム(SRS)を使って、記憶が定着するよう効率的に復習しましょう。</p>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {reviewQueue.length > 0 ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-700">本日レビューする単語</h2>
                                <span className="px-4 py-1 bg-blue-100 text-blue-700 font-bold rounded-full">{reviewQueue.length}</span>
                            </div>
                            <Flashcard word={firstWord} key={firstWord.russian} />
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <span className="text-5xl">🎉</span>
                            <h2 className="mt-4 text-2xl font-bold text-slate-700">今日のレビューは完了です！</h2>
                            <p className="mt-2 text-slate-500">よく頑張りました。次のレビューまで休憩しましょう。</p>
                        </div>
                    )}
                </div>
            </section>
            
            <section>
                 <h2 className="text-2xl font-bold text-slate-700 mb-6">学習済みの全単語</h2>
                 <div className="bg-white rounded-lg shadow-md">
                    <div className="flow-root">
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                                <div className="divide-y divide-slate-200">
                                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-left text-sm font-semibold text-slate-600">
                                        <div className="col-span-3">ロシア語</div>
                                        <div className="col-span-3">発音</div>
                                        <div className="col-span-3">日本語</div>
                                        <div className="col-span-2">次の復習</div>
                                        <div className="col-span-1 text-right"></div>
                                    </div>
                                    {allWords.map((word) => (
                                        <LearnedWordListItem key={word.russian} word={word} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </section>

        </div>
    );
};

export default FavoritesView;