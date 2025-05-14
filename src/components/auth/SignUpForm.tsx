'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Japanese industry options
const JAPANESE_INDUSTRIES = [
  { id: 'manufacturing', name: '製造業' },
  { id: 'finance', name: '金融・保険業' },
  { id: 'retail', name: '小売業' },
  { id: 'healthcare', name: '医療・福祉' },
  { id: 'education', name: '教育' },
  { id: 'technology', name: 'IT・テクノロジー' },
  { id: 'government', name: '行政・公共' },
  { id: 'other', name: 'その他' }
];

// Job role options
const JOB_ROLES = [
  { id: 'executive', name: '経営者・役員' },
  { id: 'manager', name: '管理職' },
  { id: 'engineer', name: 'エンジニア・開発者' },
  { id: 'researcher', name: '研究者' },
  { id: 'marketing', name: 'マーケティング担当' },
  { id: 'hr', name: '人事・採用担当' },
  { id: 'consultant', name: 'コンサルタント' },
  { id: 'other', name: 'その他' }
];

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { signUp } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validate password match
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      setIsLoading(false);
      return;
    }
    
    try {
      // Add metadata for user profile
      const metadata = {
        full_name: fullName,
        company,
        industry,
        job_role: jobRole
      };
      
      const { error } = await signUp(email, password, metadata);
      
      if (error) {
        setError(error.message);
        setSuccess(false);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('予期せぬエラーが発生しました。もう一度お試しください。');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        アカウント作成
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          登録ありがとうございます！確認メールをお送りしました。メールを確認して登録を完了してください。
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            メールアドレス*
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            パスワード*
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            minLength={8}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            8文字以上で入力してください
          </p>
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="confirmPassword" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            パスワード（確認）*
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="fullName" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            お名前
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="company" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            会社名
          </label>
          <input
            id="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="industry" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            業界
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">選択してください</option>
            {JAPANESE_INDUSTRIES.map(industryOption => (
              <option key={industryOption.id} value={industryOption.id}>
                {industryOption.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label 
            htmlFor="jobRole" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            役職・職種
          </label>
          <select
            id="jobRole"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">選択してください</option>
            {JOB_ROLES.map(roleOption => (
              <option key={roleOption.id} value={roleOption.id}>
                {roleOption.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '登録中...' : 'アカウント作成'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          すでにアカウントをお持ちですか？{' '}
          <Link 
            href="/auth/sign-in" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
} 