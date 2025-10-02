// FIX: Import Declension type for use in component constants.
import { Word, Declension } from '../types';

interface CaseDrillModalProps {
    word: Word;
    onClose: () => void;
}

// FIX: Correctly type declensionOrder using the imported Declension type
// instead of trying to access the 'word' prop outside the component scope.
const declensionOrder: (keyof Declension)[] = [
    'nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'prepositional'
];

// FIX: Add a specific type to caseNameMapping for better type safety and to ensure
// it correctly maps all keys from the Declension type.
const caseNameMapping: Record<keyof Declension, string> = {
    nominative: '主格',
    genitive: '生格',
    dative: '与格',
    accusative: '対格',
    instrumental: '造格',
    prepositional: '前置格'
};

const CaseDrillModal = ({ word, onClose }: CaseDrillModalProps) => {
    if (!word.caseInfo || !word.baseForm) return null;

    const { caseInfo, baseForm, russian } = word;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col gap-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-700">格変化ドリル: <span className="font-cyrillic font-semibold" lang="ru">{baseForm}</span></h2>
                        <p className="text-sm text-slate-500 mt-1">文中では「<span className="font-cyrillic font-medium" lang="ru">{russian}</span>」として使われています。</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0 ml-4" aria-label="閉じる">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-slate-800 mb-1">
                        格: <span className="font-bold text-lg">{caseInfo.caseNameJapanese}</span>
                    </h3>
                    <p className="text-slate-600 leading-relaxed"><span className="font-semibold">理由:</span> {caseInfo.explanation}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">格変化の全表</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">格</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">単数形</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">複数形</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {declensionOrder.map(caseKey => (
                                    <tr 
                                        key={caseKey} 
                                        className={caseKey.toLowerCase() === caseInfo.caseName.toLowerCase() ? 'bg-blue-50' : ''}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{caseNameMapping[caseKey]}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 font-cyrillic" lang="ru">{caseInfo.declensionTable.singular[caseKey]}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 font-cyrillic" lang="ru">{caseInfo.declensionTable.plural[caseKey]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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

export default CaseDrillModal;