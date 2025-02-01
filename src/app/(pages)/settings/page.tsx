import Link from 'next/link'
import React from 'react'

export default function page() {
  return (<div className='mx-auto max-w-screen-sm min-h-[100dvh] flex flex-col items-center justify-center'>
    <h1> THIS PAGE IS A WORK IN PROGRESS!!!!</h1>
    <Link href={'/'} className='text-blue-700 text-2xl underline'> &lt;&lt; Go back HOME</Link>
</div>)
}