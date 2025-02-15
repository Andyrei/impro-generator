import LanguageSelector from '@/components/custom-ui/LanguageSelector'
import Link from 'next/link'
import React from 'react'

export default function page() {
  return (<div>
    <h1 className="text-3xl font-bold text-center">Settings</h1>
    <div className=''>
      <h2 className='text-xl font-bold my-5'>Language settings</h2>

      <div className=''>
        <p>Select Language </p>
        <LanguageSelector />
      </div>
    </div>
</div>)
}