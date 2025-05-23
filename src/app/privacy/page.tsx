'use client';

import { useTranslation } from '@/contexts/LanguageContext';

export default function PrivacyPolicy() {
  const { locale } = useTranslation();
  
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="bg-black/50 border border-green-900/30 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-green-400 mb-8">
          {locale === 'en' ? 'Privacy Policy' : 'プライバシーポリシー'}
        </h1>
        
        {locale === 'ja' ? (
          <div className="space-y-6 text-green-300">
            <p className="mb-4">
              dera株式会社（以下、「当社」）は、お客様の個人情報の保護を重要と考えております。
              当社は、以下のプライバシーポリシーに従って、お客様の個人情報を取り扱います。
            </p>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">1. 個人情報の収集</h2>
              <p>
                当社は、サービスの提供、カスタマーサポート、マーケティング活動などの目的で、
                お客様の個人情報を収集することがあります。収集する個人情報には、氏名、メールアドレス、
                電話番号などが含まれます。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">2. 個人情報の利用目的</h2>
              <p>
                当社は、収集した個人情報を以下の目的で利用します：
              </p>
              <ul className="list-disc pl-5 mt-2">
                <li>サービスの提供・改善</li>
                <li>お問い合わせへの対応</li>
                <li>新サービスの案内やお知らせの送信</li>
                <li>統計データの作成</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">3. 個人情報の管理</h2>
              <p>
                当社は、個人情報の正確性と安全性を確保するため、適切な管理体制を整えています。
                また、個人情報への不正アクセスや漏洩を防止するための措置を講じています。
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-green-300">
            <p className="mb-4">
              dera Inc. (hereinafter referred to as "the Company") recognizes the importance of protecting your personal information.
              The Company handles your personal information in accordance with the following privacy policy.
            </p>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Collection of Personal Information</h2>
              <p>
                The Company may collect your personal information for purposes such as providing services, customer support, and marketing activities.
                Personal information collected may include your name, email address, and phone number.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">2. Purpose of Use</h2>
              <p>
                The Company uses the collected personal information for the following purposes:
              </p>
              <ul className="list-disc pl-5 mt-2">
                <li>Providing and improving services</li>
                <li>Responding to inquiries</li>
                <li>Sending notifications about new services and announcements</li>
                <li>Creating statistical data</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">3. Management of Personal Information</h2>
              <p>
                The Company has established an appropriate management system to ensure the accuracy and security of personal information.
                We also take measures to prevent unauthorized access to or leakage of personal information.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}