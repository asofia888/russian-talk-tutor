import React, { useMemo } from 'react';
import { useAudio } from '../contexts/AudioContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    const { 
        voices, 
        selectedVoice, 
        setSelectedVoice, 
        rate, 
        setRate 
    } = useAudio();

    const russianVoices = useMemo(() => voices.filter(v => v.lang.startsWith('ru')), [voices]);

    const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const voice = voices.find(v => v.name === event.target.value) || null;
        setSelectedVoice(voice);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md flex flex-col gap-6 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">音声設定</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="閉じる">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="space-y-2">
                    <label htmlFor="voice-select" className="block text-sm font-medium text-slate-700">
                        音声の選択
                    </label>
                    <select
                        id="voice-select"
                        value={selectedVoice?.name || ''}
                        onChange={handleVoiceChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {russianVoices.length > 0 ? (
                            russianVoices.map(voice => (
                                <option key={voice.name} value={voice.name}>
                                    {voice.name} ({voice.lang})
                                </option>
                            ))
                        ) : (
                            <option disabled>利用可能なロシア語の音声がありません</option>
                        )}
                    </select>
                     <p className="text-xs text-slate-500 mt-1">
                        音声の種類は、お使いのブラウザやOSによって異なります。
                    </p>
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="rate-slider" className="block text-sm font-medium text-slate-700">
                        読み上げ速度: <span className="font-bold">{rate.toFixed(1)}x</span>
                    </label>
                    <input
                        id="rate-slider"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
             <style>{`
                @keyframes fade-in-scale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale { animation: fade-in-scale 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default SettingsModal;