'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

let browserSupabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (typeof window === 'undefined') return null
  if (browserSupabase) return browserSupabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nuolpdhxcarpdmoavmrf.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b2xwZGh4Y2FycGRtb2F2bXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTIwMTIsImV4cCI6MjA2Njk2ODAxMn0.4ozPrMw7G8FHEpYDBQYwT6ZmghhtKMxVhHSOzkD2pTE'
  browserSupabase = createClient(supabaseUrl, supabaseAnonKey)
  return browserSupabase
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = getSupabase()
      if (!supabase) throw new Error('Supabase não disponível')
      let result
      if (isSignUp) {
        console.log('Attempting sign up with:', { email })
        result = await supabase.auth.signUp({
          email,
          password,
        })
        console.log('Sign up result:', result)
      } else {
        console.log('Attempting sign in with:', { email })
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        console.log('Sign in result:', result)
      }

      if (result.error) {
        console.error('Auth error:', result.error)
        setError(result.error.message)
      } else if (result.data?.user) {
        console.log('Auth success, user:', result.data.user)
        if (isSignUp && !result.data.user.email_confirmed_at) {
          setError('Please check your email and confirm your account before signing in.')
        } else {
          router.push('/')
        }
      } else {
        console.log('No error but no user data:', result)
        setError('Authentication failed - no user data returned')
      }
    } catch (err) {
      console.error('Auth exception:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Criar conta' : 'Entrar no sistema'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Receita Pro - Sistema de Gestão para Panificação
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processando...' : (isSignUp ? 'Criar conta' : 'Entrar')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
