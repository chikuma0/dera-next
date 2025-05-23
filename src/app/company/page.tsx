'use client';

import { useTranslation } from '@/contexts/LanguageContext';

export default function CompanyInfo() {
  const { locale } = useTranslation();
  
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="bg-black/50 border border-green-900/30 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-green-400 mb-8">
          {locale === 'en' ? 'Company Information' : '会社概要'}
        </h1>
        
        {locale === 'ja' ? (
          <div className="space-y-8 text-green-300">
            <section>
              <h2 className="text-xl font-semibold mb-2">会社名</h2>
              <p>dera株式会社 (dera inc.)</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">代表者</h2>
              <p>代表取締役 坪井ちくま</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">所在地</h2>
              <p>〒164-0013</p>
              <p>東京都中野区弥生町4-36-13-501</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">設立</h2>
              <p>2023年7月</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">事業内容</h2>
              <ul className="list-disc pl-5">
                <li>ITおよびクリエイティブ領域におけるサービス開発・提供</li>
              </ul>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-green-300">
            <section>
              <h2 className="text-xl font-semibold mb-2">Company Name</h2>
              <p>dera Inc. (dera株式会社)</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Representative</h2>
              <p>CEO: Chikuma Tsuboi</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Headquarters</h2>
              <p>4-36-13-501 Yayoicho, Nakano-ku, Tokyo 164-0013, Japan</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Established</h2>
              <p>July 2023</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-2">Business Description</h2>
              <ul className="list-disc pl-5">
                <li>Service development and provision for the IT and creative industries</li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}