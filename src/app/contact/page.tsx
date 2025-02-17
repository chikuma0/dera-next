'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/contexts/LanguageContext';

export default function ContactPage() {
  const { translate } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-8 text-center">
          {translate('contact.title')}
        </h1>
        <p className="text-base sm:text-lg mb-8 sm:mb-12 text-center text-green-300">
          {translate('contact.subtitle')}
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6 sm:p-8 border border-green-400 rounded-lg mx-4 sm:mx-0"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{translate('contact.thankYou')}</h2>
            <p className="text-sm sm:text-base text-green-300">{translate('contact.responseMessage')}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5 sm:mb-2">
                {translate('contact.form.name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5 sm:mb-2">
                {translate('contact.form.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-1.5 sm:mb-2">
                {translate('contact.form.company')}
              </label>
              <input
                type="text"
                id="company"
                name="company"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1.5 sm:mb-2">
                {translate('contact.form.message')}
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none text-sm sm:text-base"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-400 text-black py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting
                  ? translate('contact.form.submitting')
                  : translate('contact.form.submit')}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}