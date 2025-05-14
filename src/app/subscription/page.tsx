import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'サブスクリプション | AI Adaptation Platform',
  description: 'AIアダプテーションプラットフォームのサブスクリプションプラン',
};

export default function SubscriptionPage() {
  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            AIアダプテーションをさらに加速
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            グローバルAIトレンドを日本のビジネスに実装するための最適なプランをお選びください。
          </p>
        </div>
        
        <SubscriptionPlans />
        
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            よくある質問
          </h2>
          
          <div className="mt-8 max-w-3xl mx-auto">
            <dl className="space-y-8">
              <div>
                <dt className="text-lg font-medium text-gray-900 dark:text-white">
                  プランはいつでも変更できますか？
                </dt>
                <dd className="mt-2 text-gray-600 dark:text-gray-300">
                  はい、いつでもアップグレードまたはダウングレードが可能です。アップグレードは即時反映され、ダウングレードは現在の請求期間の終了後に適用されます。
                </dd>
              </div>
              
              <div>
                <dt className="text-lg font-medium text-gray-900 dark:text-white">
                  複数のチームメンバーを追加するにはどうすればよいですか？
                </dt>
                <dd className="mt-2 text-gray-600 dark:text-gray-300">
                  チームプランまたはエンタープライズプランでは、管理画面からチームメンバーを招待できます。チームプランは最大5名まで、エンタープライズプランは無制限にユーザーを追加できます。
                </dd>
              </div>
              
              <div>
                <dt className="text-lg font-medium text-gray-900 dark:text-white">
                  実装ガイドはどのように提供されますか？
                </dt>
                <dd className="mt-2 text-gray-600 dark:text-gray-300">
                  実装ガイドは、アカウントページからアクセスできる専用のライブラリに提供されます。コードサンプル、設定手順、および日本市場に特化した実装のヒントが含まれています。
                </dd>
              </div>
              
              <div>
                <dt className="text-lg font-medium text-gray-900 dark:text-white">
                  エンタープライズプランについてもっと詳しく知るにはどうすればよいですか？
                </dt>
                <dd className="mt-2 text-gray-600 dark:text-gray-300">
                  エンタープライズプランについては、お問い合わせフォームからご連絡いただくか、sales@aiadaptation.jpまでメールでお問い合わせください。専任のアカウントマネージャーがご要望に合わせたカスタムプランをご提案いたします。
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 