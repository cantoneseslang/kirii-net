"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

// 檢查 Supabase 是否可用（非模擬客戶端）
const isSupabaseAvailable = typeof supabase.auth?.getSession === "function"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isSupabaseAvailable: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null
    data: { user: User | null; session: Session | null }
  }>
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null
    data: { user: User | null; session: Session | null }
  }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 如果 Supabase 不可用，則直接設置為未加載狀態
    if (!isSupabaseAvailable) {
      setIsLoading(false)
      return
    }

    // 初始化會話
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user || null)
        setIsLoading(false)

        // 監聽認證狀態變化
        const {
          data: { subscription },
        } = await supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session)
          setUser(session?.user || null)
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("初始化認證時出錯:", error)
        setIsLoading(false)
      }
    }

    initSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseAvailable) {
      return {
        error: new Error("預覽模式：認證功能不可用"),
        data: { user: null, session: null },
      }
    }

    try {
      return await supabase.auth.signInWithPassword({
        email,
        password,
      })
    } catch (error) {
      return {
        error: error as Error,
        data: { user: null, session: null },
      }
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseAvailable) {
      return {
        error: new Error("預覽模式：認證功能不可用"),
        data: { user: null, session: null },
      }
    }

    try {
      return await supabase.auth.signUp({
        email,
        password,
      })
    } catch (error) {
      return {
        error: error as Error,
        data: { user: null, session: null },
      }
    }
  }

  const signOut = async () => {
    if (isSupabaseAvailable) {
      await supabase.auth.signOut()
    }
  }

  const value = {
    user,
    session,
    isLoading,
    isSupabaseAvailable,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
