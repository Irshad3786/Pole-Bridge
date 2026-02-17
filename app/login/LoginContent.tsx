'use client'
import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/Logo'

export default function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState('/dashboard')

  useEffect(() => {
    const callback = searchParams.get('callbackUrl')
    if (callback) {
      setCallbackUrl(callback)
    }
  }, [searchParams])

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignupData(prev => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsLoading(true)

    const result = await signIn('credentials', {
      email: loginData.email,
      password: loginData.password,
      redirect: false
    })

    if (result?.error) {
      setFormError(result.error)
      setIsLoading(false)
      return
    }

    if (result?.ok) {
      router.push(callbackUrl)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsLoading(true)

    if (signupData.password !== signupData.confirmPassword) {
      setFormError('Passwords do not match')
      setIsLoading(false)
      return
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Register failed:', text)
      setFormError('Registration failed. Please try again.')
      setIsLoading(false)
      return
    }

    const data = await res.json()
    setSignupData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    // Automatically sign in after successful registration
    const signInResult = await signIn('credentials', {
      email: signupData.email,
      password: signupData.password,
      redirect: false
    })

    if (signInResult?.ok) {
      router.push(callbackUrl)
    } else {
      setFormError('Account created! Please sign in.')
      setIsSignUp(false)
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setFormError('')
    await signIn('google', { callbackUrl: callbackUrl })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      {!isSignUp ? (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-8">
              <Logo />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your Poll-Bridge account</p>
            </div>

            {formError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="text-right">
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium text-sm">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-900 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 14 14">
                  <path fill="#fff" fillRule="evenodd" d="m6.547 10.263l-2.81-2.81c.309-.517.617-1.052.922-1.584c1.016-1.766 2.008-3.49 2.938-4.387c2.524-2.524 5.981-1.06 5.981-1.06s1.464 3.457-1.06 5.981c-.89.922-2.587 1.9-4.34 2.908c-.546.315-1.097.632-1.631.952m2.14-6.532a1.582 1.582 0 1 1 3.164 0a1.582 1.582 0 0 1-3.163 0m-4.09-.232C3.18 3.122 1.849 3.82.668 4.903a.48.48 0 0 0 .089.765l1.905 1.148l.002-.004c.275-.46.582-.993.894-1.533c.355-.617.716-1.243 1.04-1.78m2.587 7.84l1.148 1.905a.48.48 0 0 0 .765.088c1.083-1.18 1.782-2.512 1.404-3.93c-.522.314-1.07.63-1.613.943l-.083.048c-.548.316-1.091.628-1.616.943zM2.622 9.343a2 2 0 0 1 1.402 3.46c-.222.212-.569.379-.89.506a11 11 0 0 1-1.1.358c-.367.1-.717.18-.982.233a6 6 0 0 1-.336.059q-.066.009-.133.013a.5.5 0 0 1-.198-.022a.5.5 0 0 1-.241-.156a.5.5 0 0 1-.11-.22a.6.6 0 0 1-.012-.176c.003-.04.009-.086.015-.128c.013-.088.033-.203.06-.334c.053-.264.135-.612.235-.977c.1-.364.222-.754.359-1.095c.128-.321.294-.667.506-.888a2 2 0 0 1 1.425-.633" clipRule="evenodd"/>
                </svg>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-gray-600 mt-8">
              Don't have an account?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-8">
              <Logo />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600">Join Poll-Bridge today</p>
            </div>

            {formError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  disabled={isLoading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-900 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 14 14">
                  <path fill="#fff" fillRule="evenodd" d="m6.547 10.263l-2.81-2.81c.309-.517.617-1.052.922-1.584c1.016-1.766 2.008-3.49 2.938-4.387c2.524-2.524 5.981-1.06 5.981-1.06s1.464 3.457-1.06 5.981c-.89.922-2.587 1.9-4.34 2.908c-.546.315-1.097.632-1.631.952m2.14-6.532a1.582 1.582 0 1 1 3.164 0a1.582 1.582 0 0 1-3.163 0m-4.09-.232C3.18 3.122 1.849 3.82.668 4.903a.48.48 0 0 0 .089.765l1.905 1.148l.002-.004c.275-.46.582-.993.894-1.533c.355-.617.716-1.243 1.04-1.78m2.587 7.84l1.148 1.905a.48.48 0 0 0 .765.088c1.083-1.18 1.782-2.512 1.404-3.93c-.522.314-1.07.63-1.613.943l-.083.048c-.548.316-1.091.628-1.616.943zM2.622 9.343a2 2 0 0 1 1.402 3.46c-.222.212-.569.379-.89.506a11 11 0 0 1-1.1.358c-.367.1-.717.18-.982.233a6 6 0 0 1-.336.059q-.066.009-.133.013a.5.5 0 0 1-.198-.022a.5.5 0 0 1-.241-.156a.5.5 0 0 1-.11-.22a.6.6 0 0 1-.012-.176c.003-.04.009-.086.015-.128c.013-.088.033-.203.06-.334c.053-.264.135-.612.235-.977c.1-.364.222-.754.359-1.095c.128-.321.294-.667.506-.888a2 2 0 0 1 1.425-.633" clipRule="evenodd"/>
                </svg>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-gray-600 mt-8">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsSignUp(false)
                  setSignupData({ name: '', email: '', password: '', confirmPassword: '' })
                }}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
