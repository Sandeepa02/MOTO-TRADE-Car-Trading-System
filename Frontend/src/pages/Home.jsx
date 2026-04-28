import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { API_CONFIG } from '../config/apiConfig';

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/vehicles?category=branded`);
      const data = await response.json();
      if (data.success) {
        setFeaturedCars(data.data.slice(0, 6));
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="page-tight">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div
          className="relative rounded-3xl overflow-hidden min-h-[520px] bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(4,12,28,0.82) 0%, rgba(4,12,28,0.58) 45%, rgba(4,12,28,0.25) 100%), url('https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1800&q=80')"
          }}
        >
          <div className="px-6 sm:px-10 py-10 sm:py-14 max-w-2xl text-white">
            <p className="text-[10px] tracking-[0.22em] uppercase font-semibold text-white/75">
              Precision automotive marketplace
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
              Experience the Precision of Trading.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/85 max-w-xl">
              Discover a curated selection of the world&apos;s finest automobiles, engineered for enthusiasts and collectors.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/branded-cars" className="btn-portal px-6">
                Buy Car
              </Link>
              <Link to="/user-profile/cart" className="btn-ghost bg-white/95 text-gray-900 hover:bg-white px-6 subtle-ring">
                Visit My Cart
              </Link>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-[95%] max-w-3xl panel-soft p-3 sm:p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button type="button" className="h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white">
                Any Brand
              </button>
              <button type="button" className="h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white">
                Max 5 years
              </button>
              <button type="button" className="h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white">
                Automatic
              </button>
              <Link
                to="/second-hand-cars"
                className="h-11 rounded-xl text-sm font-bold text-white bg-primary-700 hover:bg-primary-800 flex items-center justify-center"
              >
                Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-[#f7f4fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-gray-900">Featured Inventory</h2>
            <Link to="/branded-cars" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
              View all
            </Link>
          </div>
          <p className="text-sm text-gray-600 mt-2">Hand-selected luxury and performance vehicles currently available.</p>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {featuredCars.map((car) => (
                <CarCard key={car._id || car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900">Network of Excellence</h2>
            <p className="text-sm text-gray-600 mt-2">We partner with only the most trusted automotive brands and dealers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-9">
            {[
              {
                name: 'Auto Luxury Motors',
                note: 'Luxury dealer partner',
                image:
                  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=500&q=80'
              },
              {
                name: 'Vision Drive Group',
                note: 'Top-rated dealer network',
                image:
                  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=500&q=80'
              },
              {
                name: 'Motion Elite Cars',
                note: 'Performance and premium models',
                image:
                  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=500&q=80'
              }
            ].map((partner) => (
              <div key={partner.name} className="panel-muted p-5 text-center">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="w-full h-28 rounded-xl mx-auto object-cover border border-gray-200 bg-white"
                />
                <h3 className="text-base font-bold text-gray-900 mt-4">{partner.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{partner.note}</p>
                <p className="text-xs text-amber-500 mt-2">★★★★★</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-[2fr,1fr] shadow-lift">
            <div
              className="p-8 sm:p-10 text-white bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(4,10,26,0.88) 0%, rgba(4,10,26,0.62) 70%), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80')"
              }}
            >
              <p className="text-sm uppercase tracking-wide text-white/75">Find your next obsession</p>
              <h3 className="mt-3 text-3xl font-extrabold max-w-lg">Discover the dream car crafted for your lifestyle.</h3>
              <Link to="/second-hand-cars" className="inline-block mt-6 btn-portal">
                Explore Marketplace
              </Link>
            </div>
            <div className="bg-gradient-to-b from-primary-700 to-primary-800 text-white p-8 sm:p-10">
              <p className="text-2xl font-extrabold">Sell With Precision</p>
              <p className="text-sm text-white/85 mt-3">List your vehicle in minutes and reach serious buyers faster.</p>
              <Link
                to="/seller-dashboard/add-listing"
                className="inline-flex items-center justify-center mt-6 bg-white text-primary-800 hover:bg-gray-100 font-bold rounded-xl px-5 h-11"
              >
                Start Listing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;