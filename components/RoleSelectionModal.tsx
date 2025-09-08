
import React from 'react';

interface RoleSelectionModalProps {
    speakers: string[];
    onSelect: (speaker: string) => void;
}

const RoleSelectionModal = ({ speakers, onSelect }: RoleSelectionModalProps) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">どちらの役を練習しますか？</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {speakers.map(speaker => (
                    <button
                        key={speaker}
                        onClick={() => onSelect(speaker)}
                        className="w-full bg-blue-500 text-white font-bold py-4 px-8 text-xl rounded-lg hover:bg-blue-600 transition-transform duration-300 hover:scale-105"
                    >
                        {speaker}さん
                    </button>
                ))}
            </div>
        </div>
    </div>
);

export default RoleSelectionModal;
