
import { Link } from 'react-router-dom';

const LegalView = () => {
    return (
        <div className="bg-white p-6 md:p-10 rounded-lg shadow-md max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">
                プライバシーポリシー & 免責事項
            </h1>

            <section id="privacy-policy" className="mb-12">
                <h2 className="text-2xl font-bold text-slate-700 mb-4">プライバシーポリシー</h2>
                <div className="space-y-4 text-slate-600">
                    <p>本プライバシーポリシーは、「Russian Talk Tutor」（以下、「本サービス」といいます）の利用において、利用者の個人情報もしくはそれに準ずる情報を取り扱う際に、本サービスが遵守する方針を示すものです。</p>
                    
                    <h3 className="text-lg font-semibold text-slate-700 pt-2">1. 収集する情報と利用目的</h3>
                    <p>本サービスでは、以下の情報を収集し、それぞれの目的のために利用します。</p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>
                            <strong>音声データおよびテキストデータ:</strong> ロールプレイ機能において、利用者がマイクを通じて入力した音声、およびそれをテキストに変換したデータを収集します。これらのデータは、Google LLCが提供するGemini APIに送信され、発音評価フィードバックの生成および会話機能の提供のために利用されます。
                        </li>
                        <li>
                            <strong>お気に入り単語データ:</strong> 利用者がお気に入りとして登録した単語は、利用者の利便性向上のため、お使いのブラウザのローカルストレージに保存されます。この情報はサーバーには保存されません。
                        </li>
                         <li>
                            <strong>音声設定:</strong> 利用者が設定した読み上げ速度や音声の種類は、お使いのブラウザのローカルストレージに保存されます。
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-700 pt-2">2. 第三者への情報提供</h3>
                     <p>本サービスは、機能提供のためにGoogle Gemini APIを利用しており、その過程で利用者の音声データやテキストデータをGoogleに送信します。Googleのデータ利用に関する方針については、<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Googleのプライバシーポリシー</a>をご確認ください。</p>
                     
                    <h3 className="text-lg font-semibold text-slate-700 pt-2">3. プライバシーポリシーの変更</h3>
                    <p>本サービスは、法令の変更やサービス内容の改善に伴い、本プライバシーポリシーを改定することがあります。重要な変更がある場合には、本サービス上でお知らせします。</p>
                </div>
            </section>

            <section id="disclaimer">
                <h2 className="text-2xl font-bold text-slate-700 mb-4">免責事項</h2>
                 <div className="space-y-4 text-slate-600">
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>
                            本サービスでAIによって生成される会話内容、翻訳、発音、文法解説、フィードバックは、機械学習モデルに基づいたものであり、その正確性、完全性、適切性を保証するものではありません。すべての情報は学習の参考としてご利用ください。
                        </li>
                        <li>
                            本サービスの利用により利用者に生じたいかなる損害についても、開発者は一切の責任を負いかねますので、あらかじめご了承ください。
                        </li>
                        <li>
                           本サービスは、事前の通知なく内容の変更、提供の中断または終了を行うことがあります。
                        </li>
                         <li>
                            本サービスは語学学習の補助を目的としたものであり、専門的な通訳、翻訳、または正式な語学教育に代わるものではありません。
                        </li>
                    </ul>
                </div>
            </section>
            <div className="mt-12 text-center">
                 <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    ホームに戻る
                </Link>
            </div>
        </div>
    );
};

export default LegalView;