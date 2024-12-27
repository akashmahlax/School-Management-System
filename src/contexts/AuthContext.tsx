'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Provider } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthContextType = {
  user: User | null
  userRole: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string, phoneNumber: string, role: string) => Promise<void>
  signUpWithSocial: (provider: Provider) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        if (data) {
          setUserRole(data.role)
        }
      } else {
        setUserRole(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, username: string, phoneNumber: string, role: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, phone: phoneNumber, role }
      }
    })
    if (error) throw error

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        phone_number: phoneNumber,
        role: role,
      })
    }
  }

  const signUpWithSocial = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, userRole, signIn, signUp, signUpWithSocial, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

