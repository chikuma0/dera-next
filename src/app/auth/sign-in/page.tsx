import { SignInForm } from '@/components/auth/SignInForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン | AI Adaptation Platform',
  description: 'AIアダプテーションプラットフォームへのログイン',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            AIアダプテーションプラットフォーム
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            AI活用のための実践的な知見と実装ガイドを提供するプラットフォーム
          </p>
        </div>
        
        <SignInForm />
      </div>
    </div>
  );
} 