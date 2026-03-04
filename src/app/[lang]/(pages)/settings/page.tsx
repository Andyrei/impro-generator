import LanguageSelector from '@/components/custom-ui/LanguageSelector'

export default function page() {
  return (<div  className="mx-5">
    <h1 className="text-3xl font-bold text-center">Settings</h1>
    <div className=''>
      <h2 className='text-xl font-bold my-5'>Language settings</h2>

      <div className='flex align-middle items-center gap-5'>
        <p>Select Language </p>
        <LanguageSelector />
      </div>
    </div>
</div>
)
}