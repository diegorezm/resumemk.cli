import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Footer} from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resumemk",
  authors: [
    {
      name: "Diego Rezende",
      url: "https://diegorezm.netlify.app/",
    },
  ],
  keywords:
    "resume builder, Markdown resume, free resume maker, professional resume generator, Resumemk, create resume online",

  description:
    "Create your resume for free with Resumemk using Markdown. Build professional resumes quickly and effortlessly.",
  openGraph: {
    images: "https://resumemk.xyz/og.png",
    title: "Resumemk - Your resume with markdown!",
    description:
      "Create your resume for free with Resumemk using Markdown. Build professional resumes quickly and effortlessly.",
    url: "https://resumemk.xyz",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col justify-between min-h-screen`}
      >
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
