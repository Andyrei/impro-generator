import LanguageSelector from '@/app/[lang]/(pages)/settings/(components)/LanguageSelector'
import { PreventScreenSleepCheckbox, StopwatchTimeFormatSelector } from './(components)/StopWatchSettings'
import { ThemeSelector } from './(components)/ThemeSettings'

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
    <div className='my-10 space-y-5'>
      <h2 className='text-xl font-bold my-5'>Stopwatch settings</h2>
      <div className='flex align-middle items-center justify-between gap-5'>
        <p>Stopwatch time format</p>
        <StopwatchTimeFormatSelector />
      </div>
      <div className='flex align-middle items-center justify-between gap-5'>
        <p>Prevent screen sleep</p>
        <PreventScreenSleepCheckbox />
      </div>
    </div>
    <div className='my-10'>
      <h2 className='text-xl font-bold my-5'>Theme settings</h2>
      <div className='flex align-middle items-center justify-between gap-5'>
        <p>Theme</p>
        <ThemeSelector />
      </div>
    </div>
</div>
)
}