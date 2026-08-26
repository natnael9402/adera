import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import HowItWorks from "@/components/HowItWorks";
import FeaturedCauses from "@/components/FeaturedCauses";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyAdera from "@/components/WhyAdera";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <FeaturedCauses />
        <FeaturedProducts />
        <HowItWorks />
        <WhyAdera />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
