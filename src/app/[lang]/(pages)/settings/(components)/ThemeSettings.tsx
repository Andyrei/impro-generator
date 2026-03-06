

function ThemeSelector() {
  return (
    <div className='flex align-middle items-center gap-5'>
      <p>Theme</p>
      <select className='border rounded-md px-2 py-1'>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  )
}

export  {
    ThemeSelector
}