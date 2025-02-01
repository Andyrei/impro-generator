'use client'
import { randomIntFromInterval } from '@/lib/general'
import React, { use, useEffect } from 'react'

type Props = {
    action: string
    actionTitle: string
    handleShowChoosenAction: (action: string) => void
    btn_type_class?: 'classic' | 'worn' | 'inset'
}

export default function ActionButton({action, actionTitle, handleShowChoosenAction, btn_type_class = "classic"}: Props) {

  useEffect(() => {

  }, [])

  return (
    <>
      <button className={`col-span-2 row-span-2 py-10 nokia-btn ${btn_type_class}`} onClick={()=>{
          handleShowChoosenAction(action)}
        }>
        <p className='btn-text glitch' data-title={actionTitle}>{actionTitle}</p>
        <div className="wear-overlay"></div>
      </button>
    </>
  )
}