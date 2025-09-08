import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundView = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full min-h-[60vh]">
            <div className="bg-white p-10 rounded-2xl shadow-lg">
                <h1 className="text-9xl font-black text-blue-600">404</h1>
                <h2 className="mt-2 text-3xl font-bold text-slate-800">ページが見つかりません</h2>
                <p className="mt-4 text-slate-600">
                    お探しのページは移動または削除された可能性があります。<br/>
                    URLをご確認の上、再度お試しください。
                </p>
                <Link
                    to="/"
                    className="mt-8 inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-transform duration-300 hover:scale-105"
                >
                    ホームに戻る
                </Link>
            </div>
        </div>
    );
};

export default NotFoundView;
