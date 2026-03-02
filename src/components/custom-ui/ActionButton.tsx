'use client'
import { useLocale } from '@/context/LocaleContext';
import React from 'react'

type Props = {
    action: string
    actionTitle: string
    wordCount?: number
    handleShowChoosenAction: (action: string) => void
    btn_type_class?: 'classic' | 'worn' | 'inset'
}

export default function ActionButton({action, actionTitle, wordCount, handleShowChoosenAction, btn_type_class = "classic"}: Props) {
  const { dictionary: intl, locale } = useLocale();

  return (
    <>
      <button className={`col-span-2 row-span-2 py-10 nokia-btn ${btn_type_class}`} onClick={()=>{
          handleShowChoosenAction(action)}
        }>
        <p className='btn-text glitch' data-title={actionTitle}>{actionTitle}</p>
        <div className="wear-overlay"></div>
        {wordCount !== undefined && (
          <div className="absolute bottom-2 right-2 text-xs text-green-200 bg-black bg-opacity-50 px-1 rounded">
          {intl?.home?.categories.words}: {wordCount}
          </div>
        )}
      </button>
    </>
  )
}