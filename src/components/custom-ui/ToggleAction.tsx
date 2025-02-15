'use client'
import { randomIntFromInterval } from '@/lib/general'
import React from 'react'

type Props = {
    action: string
    actionTitle: string
    handleShowChoosenAction: (action: string) => void
}

export default function ActionButton({action, actionTitle, handleShowChoosenAction}: Props) {

    return <>
      <button className="col-span-2 row-span-2 bg-yellow-600 p-10" onClick={()=>handleShowChoosenAction(action)}>{actionTitle}</button>
    </>
}