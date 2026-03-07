'use server'

import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  return (
    <div className="grid h-full">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
