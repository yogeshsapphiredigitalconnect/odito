import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
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
              console.log("Backend token stored in NextAuth JWT");
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
      }
      if (token.provider) {
        session.provider = token.provider;
      }
      
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
})

export { handler as GET, handler as POST }
