'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedHotels from '@/components/FeaturedHotels';
import FeaturedHouses from '@/components/FeaturedHouses';
import CitiesSection from '@/components/CitiesSection';
import HotelsList from '@/components/HotelsList';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState('');

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <FeaturedHotels />
      <CitiesSection selectedCity={selectedCity} onSelectCity={setSelectedCity} />
      <FeaturedHouses selectedCity={selectedCity} />
      <HotelsList selectedCity={selectedCity} onSelectCity={setSelectedCity} />
      <Footer />
    </main>
  );
}
