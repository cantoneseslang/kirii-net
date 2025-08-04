import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from '@/lib/supabase'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Supabaseが利用できない場合はスキップ
        if (!supabaseAdmin) {
          console.warn('Supabase設定が不完全です。ユーザー情報の保存をスキップします。')
          return true
        }

        try {
          // Supabaseにユーザー情報を保存
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError)
            // エラーがあってもサインインは継続
            return true
          }

          if (!existingUser) {
            // 新規ユーザーを作成
            const { error: insertError } = await supabaseAdmin
              .from('users')
              .insert({
                email: user.email!,
                name: user.name!,
                avatar_url: user.image,
                access_token: account.access_token,
                refresh_token: account.refresh_token
              })

            if (insertError) {
              console.error('Error creating user:', insertError)
              // エラーがあってもサインインは継続
            }
          } else {
            // 既存ユーザーのトークンを更新
            const { error: updateError } = await supabaseAdmin
              .from('users')
              .update({
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                updated_at: new Date().toISOString()
              })
              .eq('email', user.email)

            if (updateError) {
              console.error('Error updating user:', updateError)
              // エラーがあってもサインインは継続
            }
          }

          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          // エラーがあってもサインインは継続
          return true
        }
      }
      return true
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
})

export { handler as GET, handler as POST } 