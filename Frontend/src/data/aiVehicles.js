// AI Vehicle Recommendation Data
export const aiVehicleData = {
  primaryRecommendation: {
    id: 1,
    name: "Elara Saloon - Premium Match",
    brand: "Toyota",
    model: "Camry Hybrid",
    year: 2024,
    price: 3200000, // LKR
    priceFormatted: "Rs. 3,200,000",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1525609000669-f58aa0432ef3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: [
      "Advanced Safety Assist System",
      "Eco Mode with 25km/L efficiency",
      "Premium Leather Interior"
    ],
    fuelType: "Hybrid",
    transmission: "Automatic",
    description: "Perfect blend of luxury and efficiency for your daily commute and weekend adventures."
  },
  alternativeSuggestions: [
    {
      id: 2,
      name: "Urban Cruiser SUV",
      brand: "Honda",
      model: "CR-V",
      year: 2024,
      price: 3500000,
      priceFormatted: "Rs. 3,500,000",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1542748457-22a013c7b1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tag: "Best for Family",
      fuelType: "Petrol",
      transmission: "Automatic"
    },
    {
      id: 3,
      name: "Compact City Master",
      brand: "Mazda",
      model: "Mazda3",
      year: 2024,
      price: 2800000,
      priceFormatted: "Rs. 2,800,000",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tag: "Budget Friendly",
      fuelType: "Petrol",
      transmission: "Automatic"
    },
    {
      id: 4,
      name: "Adventure 4x4 Pro",
      brand: "Subaru",
      model: "Outback",
      year: 2024,
      price: 4200000,
      priceFormatted: "Rs. 4,200,000",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tag: "All-Terrain",
      fuelType: "Diesel",
      transmission: "AWD"
    }
  ]
};

export const vehicleTypes = [
  {
    id: 'sedan',
    name: 'Compact Sedan',
    image: new URL('./compact_sedan.jpg', import.meta.url).href,
    description: 'Efficient and stylish'
  },
  {
    id: 'suv',
    name: 'Modern SUV',
    image: new URL('./modern_suv.jpg', import.meta.url).href,
    description: 'Spacious and powerful'
  },
  {
    id: 'hatchback',
    name: 'Family Hatchback',
    image: new URL('./Family_hatchback.jpg', import.meta.url).href,
    description: 'Practical and comfortable'
  },

  {
    id: 'CAB',
    name: 'CAB',
    image: new URL('./cab.jpg', import.meta.url).href,
    description: 'cab-style passenger vehicles'
  }
];

export const usageScenarios = [
  {
    id: 'daily',
    title: 'Daily City Commute',
    icon: '🏙️',
    description: 'Perfect for urban driving'
  },
  {
    id: 'weekend',
    title: 'Weekend Adventure',
    icon: '🏔️',
    description: 'Explore off-road trails'
  },
  {
    id: 'family',
    title: 'Family Trips',
    icon: '👨‍👩‍👧‍👦',
    description: 'Comfortable for everyone'
  }
];

export const advancedFeatures = [
  { id: 'safety', label: 'Safety Assist', icon: '🛡️' },
  { id: 'eco', label: 'Fuel Eco Mode', icon: '🌱' },
  { id: 'leather', label: 'Leather Seats', icon: '💺' },
  { id: 'awd', label: '4x4 AWD', icon: '⛰️' }
];
