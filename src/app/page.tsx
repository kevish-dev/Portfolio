import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Work from "@/components/Work";
import Education from "@/components/Education";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Analytics />
      <Header />
      <main>
        <Hero />
        <Experience />
        <Skills />
        <Work />
        <Education />
      </main>
      <Footer />
    </>
  );
}
