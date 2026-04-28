// API Configuration for Moto Trade AI Suggestion
export const API_CONFIG = {
  // Get your API key from: https://openrouter.ai/keys
  OPENROUTER_API_KEY: 'past vaild API',

  // OpenRouter API endpoint (OpenAI-compatible)
  OPENROUTER_API_URL: 'https://openrouter.ai/api/v1/chat/completions',

  // Auto-routing model mode
  OPENROUTER_MODEL: 'openrouter/auto',
  
  // Backend API URL
  BACKEND_API_URL: 'http://localhost:5000/api',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000, // 30 seconds
  
  // Maximum retry attempts
  MAX_RETRIES: 2
};

// Vehicle database for AI reference (you can expand this)
export const VEHICLE_DATABASE = [
  {
    id: 1,
    name: "Toyota Camry Hybrid",
    brand: "Toyota",
    model: "Camry",
    year: 2024,
    price: 3200000,
    priceFormatted: "Rs. 3,200,000",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1525609000669-f58aa0432ef3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["Advanced Safety Assist", "Eco Mode 25km/L", "Premium Interior"],
    fuelType: "Hybrid",
    transmission: "Automatic",
    vehicleType: "sedan",
    usage: ["daily", "family"],
    description: "Perfect blend of luxury and efficiency for daily commute."
  },
  {
    id: 2,
    name: "Honda CR-V",
    brand: "Honda",
    model: "CR-V",
    year: 2024,
    price: 3500000,
    priceFormatted: "Rs. 3,500,000",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1542748457-22a013c7b1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["Spacious Interior", "AWD Available", "Honda Sensing Safety"],
    fuelType: "Petrol",
    transmission: "Automatic",
    vehicleType: "suv",
    usage: ["family", "weekend"],
    description: "Ideal family SUV with excellent safety features."
  },
  {
    id: 3,
    name: "Mazda3",
    brand: "Mazda",
    model: "Mazda3",
    year: 2024,
    price: 2800000,
    priceFormatted: "Rs. 2,800,000",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["Sporty Design", "SkyActiv Technology", "Premium Audio"],
    fuelType: "Petrol",
    transmission: "Automatic",
    vehicleType: "hatchback",
    usage: ["daily"],
    description: "Stylish and efficient city car with sporty handling."
  },
  {
    id: 4,
    name: "Subaru Outback",
    brand: "Subaru",
    model: "Outback",
    year: 2024,
    price: 4200000,
    priceFormatted: "Rs. 4,200,000",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["Symmetrical AWD", "EyeSight Safety", "High Ground Clearance"],
    fuelType: "Diesel",
    transmission: "AWD",
    vehicleType: "suv",
    usage: ["weekend", "adventure"],
    description: "Rugged adventure vehicle with legendary AWD capability."
  },
  {
    id: 5,
    name: "Tesla Model 3",
    brand: "Tesla",
    model: "Model 3",
    year: 2024,
    price: 5500000,
    priceFormatted: "Rs. 5,500,000",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1591227458211-1c073b5e4f3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["Autopilot", "Electric Powertrain", "Long Range 500km"],
    fuelType: "Electric",
    transmission: "Automatic",
    vehicleType: "sedan",
    usage: ["daily", "eco"],
    description: "Revolutionary electric sedan with cutting-edge technology."
  },
  {
    id: 6,
    name: "Ford Ranger",
    brand: "Ford",
    model: "Ranger",
    year: 2024,
    price: 4800000,
    priceFormatted: "Rs. 4,800,000",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["4x4 Capability", "Towing Package", "Cargo Bed"],
    fuelType: "Diesel",
    transmission: "Automatic",
    vehicleType: "truck",
    usage: ["work", "weekend"],
    description: "Versatile pickup truck for work and adventure."
  }
];
