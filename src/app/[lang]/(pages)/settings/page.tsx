import LanguageSelector from '@/app/[lang]/(pages)/settings/(components)/LanguageSelector'
import { StopwatchTimeFormatSelector } from './(components)/StopWatchSettings'

export default function page() {
  return (<div className="mx-5 my-10">
    <h1 className="text-3xl font-bold text-center">Settings</h1>
    <div className='my-10'>
      <h2 className='text-xl font-bold my-5'>Language settings</h2>
      <div className='flex align-middle items-center justify-between gap-5'>
        <p>Select Language </p>
        <LanguageSelector />
      </div>
    </div>
    <div className='my-10'>
      <h2 className='text-xl font-bold my-5'>Stopwatch settings</h2>
      <div className='flex align-middle items-center justify-between gap-5'>
        <p>Stopwatch time format</p>
        <StopwatchTimeFormatSelector />
      </div>
    </div>
</div>
)
}