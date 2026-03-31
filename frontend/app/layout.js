import { Geist, Geist_Mono, Syne, DM_Sans } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";

import { ProjectProvider } from "@/contexts/ProjectContext";

import { ThemeProvider } from "next-themes";

import { GlobalAuthLoader } from "@/components/loading/GlobalAuthLoader";

import GlobalPaymentModal from "@/components/modals/GlobalPaymentModal";



const geistSans = Geist({

  variable: "--font-geist-sans",

  subsets: ["latin"],

});



const geistMono = Geist_Mono({

  variable: "--font-geist-mono",

  subsets: ["latin"],

});



const syne = Syne({

  variable: "--font-syne",

  subsets: ["latin"],

  weight: ["400", "500", "600", "700", "800"],

});



const dmSans = DM_Sans({

  variable: "--font-dm-sans",

  subsets: ["latin"],

  weight: ["400", "500", "600", "700"],

});



export const metadata = {

  title: "Odito AI - SEO Analytics Platform",

  description: "Advanced SEO analytics and auditing platform powered by AI",

};



export default function RootLayout({ children }) {

  return (

    <html lang="en" suppressHydrationWarning>

      <head>

        <link

          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"

          rel="stylesheet"

        />

      </head>

      <body

        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${dmSans.variable} antialiased`}

      >

        <ThemeProvider

          attribute="class"

          defaultTheme="dark"

          enableSystem={false}

        >

          <AuthProvider>

            <ProjectProvider>

              {children}

              <GlobalPaymentModal />

            </ProjectProvider>

          </AuthProvider>

        </ThemeProvider>

        <script

          src="https://ai-chat-five-self.vercel.app/chatBot.js"

          data-owner-id="usr_115431673788629261"

        ></script>

      </body>

    </html>

  );

}

