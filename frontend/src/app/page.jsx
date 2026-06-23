import Hero from '@/components/Hero';
import FeaturedHotels from '@/components/FeaturedHotels';
import FeaturedHouses from '@/components/FeaturedHouses';
import CitiesSection from '@/components/CitiesSection';
import HotelsList from '@/components/HotelsList';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* The hero embeds its own transparent navbar */}
      <Hero />
      <FeaturedHotels />
      <FeaturedHouses />
      <CitiesSection />
      <HotelsList />
      <Footer />
    </main>
  );
}
