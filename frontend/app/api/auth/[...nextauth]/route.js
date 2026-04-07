import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  // Increase timeout for Google OAuth discovery
  debug: process.env.NODE_ENV === 'development',
  // Add global timeout configuration
  maxAge: 60 * 60 * 24 * 7, // 7 days
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      httpOptions: {
        timeout: 15000, // 15 seconds timeout
      },
      issuer: "https://accounts.google.com",
      wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
      client: {
        token_endpoint_auth_method: "client_secret_post",
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      console.log("SIGNIN PROVIDER:", account?.provider);
      console.log("PROFILE:", profile);
      console.log("ACCOUNT:", account);
      
      // Store Google profile data for jwt callback
      if (account?.provider === "google" && profile) {
        user.googleProfile = {
          email: profile.email,
          googleId: profile.sub,
          name: profile.name,
          avatar: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name
        };
        console.log("Stored Google profile in user:", user.googleProfile);
      }
      
      // Always return true for Google to prevent AccessDenied
      if (account?.provider === "google") {
        console.log("Google provider detected - allowing sign in");
        return true;
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("REDIRECT CALLBACK - url:", url, "baseUrl:", baseUrl);
      
      // If the callbackUrl is provided and it's relative to the baseUrl, use it
      if (url.startsWith(baseUrl)) {
        console.log("REDIRECT CALLBACK - Using provided url:", url);
        return url;
      }
      
      // For relative URLs, prepend baseUrl
      if (url.startsWith('/')) {
        console.log("REDIRECT CALLBACK - Prepending baseUrl to relative url:", baseUrl + url);
        return baseUrl + url;
      }
      
      // Default fallback
      console.log("REDIRECT CALLBACK - Using default baseUrl:", baseUrl);
      return baseUrl;
    },
    async jwt({ token, account, user }) {
      console.log("JWT CALLBACK - account:", account);
      console.log("JWT CALLBACK - user:", user);
      
      // Store provider info
      if (account) {
        token.provider = account.provider;
      }
      
      // Handle backend token exchange for Google
      if (account?.provider === "google" && user?.googleProfile) {
        try {
          console.log("Calling backend OAuth endpoint...");
          
          const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/google/callback`;
          console.log("BACKEND URL:", backendUrl);
          
          console.log("PAYLOAD TO BACKEND:", user.googleProfile);
          
          const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user.googleProfile)
          });

          console.log("BACKEND RESPONSE STATUS:", response.status);

          if (response.ok) {
            const result = await response.json();
            console.log("Backend OAuth success:", result);
            
            if (result.success) {
              token.backendToken = result.data.token;
              token.backendUser = result.data.user;
              token.isNewUser = result.data.user.isNewUser;
              console.log("Backend token stored in NextAuth JWT");
              console.log("isNewUser flag:", token.isNewUser);
            } else {
              console.error("Backend OAuth error:", result.message);
            }
          } else {
            const errorText = await response.text();
            console.error("Backend OAuth failed:", response.status, errorText);
          }
        } catch (error) {
          console.error("Backend OAuth error:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("SESSION CALLBACK - token:", token);
      
      // Make backend token and user data available to client
      if (token.backendToken) {
        session.backendToken = token.backendToken;
      }
      if (token.backendUser) {
        session.backendUser = token.backendUser;
        // Include emailVerified status from backend user data
        session.backendUser.isEmailVerified = token.backendUser.isEmailVerified || false;
      }
      if (token.provider) {
        session.provider = token.provider;
      }
      if (token.isNewUser !== undefined) {
        session.isNewUser = token.isNewUser;
      }
      
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  // Add error handling for network issues
  events: {
    async signIn(message) {
      console.log("NextAuth signIn event:", message);
    },
    async signOut(message) {
      console.log("NextAuth signOut event:", message);
    },
    async error(message) {
      console.error("NextAuth error event:", message);
    }
  }
})

export { handler as GET, handler as POST }
