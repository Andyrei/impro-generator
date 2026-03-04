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
  loadAction?: boolean;
};

export default function Screen({ showDataAction }: Props) {
  const { dictionary: intl = {}, locale = 'en' } = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showDataAction?.loadAction !== undefined) {
      setIsLoading(showDataAction.loadAction);
    }
  }, [showDataAction]);

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
          {/* …spinner omitted for brevity… */}
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