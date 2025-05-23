'use client';

import { useTranslation } from '@/contexts/LanguageContext';

export default function Transactions() {
  const { locale } = useTranslation();
  
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="bg-black/50 border border-green-900/30 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-green-400 mb-8">
          {locale === 'en' ? 'Specified Commercial Transactions Act' : '特定商取引に関する表記'}
        </h1>
        
        {locale === 'ja' ? (
          <div className="space-y-6 text-green-300">
            <p className="mb-4">
              特定商取引法に基づく表記について、以下に記載します。
            </p>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">販売業者</h2>
              <p>dera株式会社</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">代表者</h2>
              <p>坪井ちくま</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">所在地</h2>
              <p>〒164-0013</p>
              <p>東京都中野区弥生町4-36-13-501</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">連絡先</h2>
              <p>メールアドレス: hello@dera.ai</p>
              <p>※お問い合わせはメールでお願いいたします</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">料金</h2>
              <p>各サービスページに記載しています</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">支払方法</h2>
              <p>銀行振込（前払い）、クレジットカード決済</p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-green-300">
            <p className="mb-4">
              The following information is provided in accordance with the Specified Commercial Transactions Act.
            </p>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Seller</h2>
              <p>dera Inc.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Representative</h2>
              <p>Chikuma Tsuboi</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p>4-36-13-501 Yayoicho, Nakano-ku, Tokyo 164-0013, Japan</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Contact</h2>
              <p>Email: hello@dera.ai</p>
              <p>* Please contact us by email</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Fees</h2>
              <p>Details are provided on each service page</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Payment Methods</h2>
              <p>Bank transfer (advance payment), credit card</p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}