const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-600">読み込み中...</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
