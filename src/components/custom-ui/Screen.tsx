'use client';                     // <–– required when you use hooks

import { useLocale } from '@/context/LocaleContext';
import { useEffect, useState } from 'react';

type ShowData = {
  word: Record<string, string>;
  category?: Record<string, string>;
  difficulty?: string;
  loadAction?: boolean;
};

type Props = {
  level?: string;
  showDataAction?: ShowData;
  isLoading?: boolean;
};

export default function Screen({ showDataAction, isLoading }: Props) {
  const { dictionary: intl = {}, locale = 'en' } = useLocale();

  /* safely read the default message – if the dictionary isn’t ready
     fall back to a hard‑coded string (or whatever makes sense for you) */
  const defaultMessage = intl?.home?.screen?.default_message ?? 'Scegli quello che vuoi e improvvisa';

  return (
    <div className="w-full min-h-52 md:py-32 flex justify-center items-center radial-gradient">
      <div className="screen_noise" />
      <div className="screen_overlay" />
      {isLoading ? (
        <div
          role="status"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <svg
            className="w-12 h-12 animate-spin text-green-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <div>
          <p className="mx-5 text-center text-2xl">
            {showDataAction
              ? showDataAction.word[locale] || showDataAction.word.en
              : defaultMessage}
          </p>

          {showDataAction?.category && (
            <div className="absolute top-5 text-base left-5">
              <span>{intl?.home?.screen?.category ?? 'Categoria'}: </span>
              <span>
                {showDataAction.category[locale] ||
                  showDataAction.category.en}
              </span>
            </div>
          )}
          {showDataAction?.difficulty && (
            <div className="absolute bottom-5 text-base left-5">
              <span>{intl?.home?.screen?.difficulty ?? 'Difficoltà'}: </span>
              <span>{showDataAction.difficulty}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}