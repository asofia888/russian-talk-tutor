
import LoadingSpinner from './icons/LoadingSpinner';
import LoadingTips from './LoadingTips';

const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-start gap-4 animate-pulse">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-200"></div>
            <div className="flex-grow space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-200"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-1/6 mb-3"></div>
            <div className="flex flex-wrap gap-2">
                <div className="h-12 w-24 bg-slate-200 rounded-lg"></div>
                <div className="h-12 w-32 bg-slate-200 rounded-lg"></div>
                <div className="h-12 w-28 bg-slate-200 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const ConversationSkeleton = () => {
    return (
        <div>
            <div className="text-center mb-8">
                 <LoadingSpinner className="h-12 w-12 text-blue-500 mx-auto" />
                <h2 className="text-2xl font-bold text-slate-700 mt-4">AIが会話を生成中...</h2>
                <p className="text-slate-500">リアルな会話を準備しています。</p>
            </div>
            
            <LoadingTips />

            <div className="mt-8 space-y-6 opacity-40 blur-sm pointer-events-none">
                 <SkeletonCard />
                 <SkeletonCard />
            </div>
        </div>
    );
};

export default ConversationSkeleton;