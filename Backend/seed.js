import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from './models/Vehicle.js';
import SparePart from './models/SparePart.js';
import Modification from './models/Modification.js';
import User from './models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Vehicle.deleteMany({});
    console.log('Cleared existing vehicles...');

    // Complete vehicle database - All categories
    const vehicles = [
      // ==================== BRANDED CARS (NEW) ====================
      {
        name: "BMW X5",
        brand: "BMW",
        model: "X5",
        year: 2024,
        price: 6500000,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Luxury Interior", "Powerful Engine", "Advanced Tech"],
        fuelType: "Hybrid",
        transmission: "Automatic",
        vehicleType: "suv",
        usage: ["luxury", "weekend"],
        description: "Premium luxury SUV with exceptional performance.",
        condition: "New",
        available: true,
        category: "branded"
      },
      {
        name: "Mercedes-Benz E-Class",
        brand: "Mercedes-Benz",
        model: "E-Class",
        year: 2024,
        price: 5800000,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Executive Comfort", "MBUX System", "Safety Plus"],
        fuelType: "Petrol",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["luxury", "daily"],
        description: "The ultimate executive sedan.",
        condition: "New",
        available: true,
        category: "branded"
      },
      {
        name: "Audi Q7",
        brand: "Audi",
        model: "Q7",
        year: 2024,
        price: 6200000,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Quattro AWD", "Virtual Cockpit", "Premium Sound"],
        fuelType: "Diesel",
        transmission: "Automatic",
        vehicleType: "suv",
        usage: ["luxury", "family"],
        description: "Sophisticated luxury SUV with cutting-edge technology.",
        condition: "New",
        available: true,
        category: "branded"
      },
      {
        name: "Tesla Model S",
        brand: "Tesla",
        model: "Model S",
        year: 2024,
        price: 8500000,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1591227458211-1c073b5e4f3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Autopilot", "Plaid Performance", "Long Range"],
        fuelType: "Electric",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["luxury", "eco"],
        description: "Revolutionary electric luxury sedan.",
        condition: "New",
        available: true,
        category: "branded"
      },
      {
        name: "Toyota Camry",
        brand: "Toyota",
        model: "Camry",
        year: 2024,
        price: 3200000,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1525609000669-f58aa0432ef3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Reliable", "Fuel Efficient", "Comfortable"],
        fuelType: "Hybrid",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["daily", "family"],
        description: "Trusted sedan with excellent reliability.",
        condition: "New",
        available: true,
        category: "branded"
      },
      {
        name: "Honda CR-V",
        brand: "Honda",
        model: "CR-V",
        year: 2024,
        price: 3500000,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1542748457-22a013c7b1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Spacious", "Safe", "Practical"],
        fuelType: "Petrol",
        transmission: "Automatic",
        vehicleType: "suv",
        usage: ["family", "daily"],
        description: "Perfect family SUV with Honda reliability.",
        condition: "New",
        available: true,
        category: "branded"
      },
      
      // ==================== SECOND HAND CARS ====================
      {
        name: "Ford Mustang",
        brand: "Ford",
        model: "Mustang",
        year: 2020,
        price: 3800000,
        rating: 4.6,
        mileage: 25000,
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["V8 Engine", "Sport Mode", "Premium Audio"],
        fuelType: "Petrol",
        transmission: "Manual",
        vehicleType: "coupe",
        usage: ["sport", "weekend"],
        description: "Classic American muscle car in excellent condition.",
        condition: "Used - Excellent",
        available: true,
        category: "second-hand",
        location: { city: "Colombo", country: "Sri Lanka" }
      },
      {
        name: "Chevrolet Camaro",
        brand: "Chevrolet",
        model: "Camaro",
        year: 2019,
        price: 3200000,
        rating: 4.5,
        mileage: 35000,
        image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Turbocharged", "Sport Suspension", "Leather Seats"],
        fuelType: "Petrol",
        transmission: "Manual",
        vehicleType: "coupe",
        usage: ["sport", "daily"],
        description: "Powerful sports coupe with aggressive styling.",
        condition: "Used - Good",
        available: true,
        category: "second-hand",
        location: { city: "Kandy", country: "Sri Lanka" }
      },
      {
        name: "Nissan GT-R",
        brand: "Nissan",
        model: "GT-R",
        year: 2018,
        price: 7500000,
        rating: 4.9,
        mileage: 45000,
        image: "https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["AWD", "Twin Turbo", "Launch Control"],
        fuelType: "Petrol",
        transmission: "Automatic",
        vehicleType: "coupe",
        usage: ["sport", "track"],
        description: "Legendary Japanese supercar killer.",
        condition: "Used - Excellent",
        available: true,
        category: "second-hand",
        location: { city: "Galle", country: "Sri Lanka" }
      },
      {
        name: "Subaru WRX",
        brand: "Subaru",
        model: "WRX",
        year: 2021,
        price: 3400000,
        rating: 4.7,
        mileage: 20000,
        image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["AWD", "Turbo Boxer", "Sport Tuned"],
        fuelType: "Petrol",
        transmission: "Manual",
        vehicleType: "sedan",
        usage: ["sport", "daily"],
        description: "Rally-bred performance sedan.",
        condition: "Used - Excellent",
        available: true,
        category: "second-hand",
        location: { city: "Colombo", country: "Sri Lanka" }
      },
      {
        name: "Toyota Camry",
        brand: "Toyota",
        model: "Camry",
        year: 2019,
        price: 2800000,
        rating: 4.4,
        mileage: 65000,
        image: "https://images.unsplash.com/photo-1525609000669-f58aa0432ef3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Hybrid Efficiency", "Comfortable", "Reliable"],
        fuelType: "Hybrid",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["daily", "family"],
        description: "Well-maintained family sedan with great fuel economy.",
        condition: "Used - Good",
        available: true,
        category: "second-hand",
        location: { city: "Negombo", country: "Sri Lanka" }
      },
      {
        name: "Honda Civic",
        brand: "Honda",
        model: "Civic",
        year: 2020,
        price: 2500000,
        rating: 4.3,
        mileage: 85000,
        image: "https://images.unsplash.com/photo-1542748457-22a013c7b1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Sporty Design", "Efficient Engine", "Modern Tech"],
        fuelType: "Petrol",
        transmission: "Manual",
        vehicleType: "sedan",
        usage: ["daily", "city"],
        description: "Popular compact sedan with sporty character.",
        condition: "Used - Fair",
        available: true,
        category: "second-hand",
        location: { city: "Kurunegala", country: "Sri Lanka" }
      },
      {
        name: "BMW 3 Series",
        brand: "BMW",
        model: "3 Series",
        year: 2018,
        price: 4200000,
        rating: 4.6,
        mileage: 55000,
        image: "https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Luxury Interior", "Dynamic Handling", "Premium Package"],
        fuelType: "Petrol",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["luxury", "daily"],
        description: "Ultimate driving machine in great condition.",
        condition: "Used - Very Good",
        available: true,
        category: "second-hand",
        location: { city: "Colombo", country: "Sri Lanka" }
      },
      {
        name: "Mercedes-Benz C-Class",
        brand: "Mercedes-Benz",
        model: "C-Class",
        year: 2017,
        price: 3800000,
        rating: 4.5,
        mileage: 95000,
        image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Luxury", "Comfort", "Star Quality"],
        fuelType: "Diesel",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["luxury", "daily"],
        description: "Elegant luxury sedan with timeless design.",
        condition: "Used - Good",
        available: true,
        category: "second-hand",
        location: { city: "Matara", country: "Sri Lanka" }
      },
      {
        name: "Audi A4",
        brand: "Audi",
        model: "A4",
        year: 2021,
        price: 4500000,
        rating: 4.7,
        mileage: 15000,
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Virtual Cockpit", "Quattro", "Premium Plus"],
        fuelType: "Petrol",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["luxury", "daily"],
        description: "Nearly new Audi with advanced technology.",
        condition: "Used - Excellent",
        available: true,
        category: "second-hand",
        location: { city: "Jaffna", country: "Sri Lanka" }
      },
      {
        name: "Volkswagen Golf",
        brand: "Volkswagen",
        model: "Golf",
        year: 2016,
        price: 2200000,
        rating: 4.2,
        mileage: 125000,
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["German Engineering", "Practical", "Efficient"],
        fuelType: "Diesel",
        transmission: "Manual",
        vehicleType: "hatchback",
        usage: ["daily", "city"],
        description: "Reliable German hatchback with great build quality.",
        condition: "Used - Fair",
        available: true,
        category: "second-hand",
        location: { city: "Anuradhapura", country: "Sri Lanka" }
      },
      {
        name: "Hyundai Elantra",
        brand: "Hyundai",
        model: "Elantra",
        year: 2020,
        price: 2400000,
        rating: 4.3,
        mileage: 75000,
        image: "https://images.unsplash.com/photo-1525609000669-f58aa0432ef3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Modern Design", "Feature Rich", "Warranty"],
        fuelType: "Petrol",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["daily", "family"],
        description: "Well-equipped sedan with great value.",
        condition: "Used - Good",
        available: true,
        category: "second-hand",
        location: { city: "Ratnapura", country: "Sri Lanka" }
      },
      {
        name: "Mazda CX-5",
        brand: "Mazda",
        model: "CX-5",
        year: 2019,
        price: 2900000,
        rating: 4.4,
        mileage: 110000,
        image: "https://images.unsplash.com/photo-1542748457-22a013c7b1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["SkyActiv", "AWD", "Premium Interior"],
        fuelType: "Petrol",
        transmission: "Automatic",
        vehicleType: "suv",
        usage: ["family", "weekend"],
        description: "Stylish SUV with excellent driving dynamics.",
        condition: "Used - Fair",
        available: true,
        category: "second-hand",
        location: { city: "Batticaloa", country: "Sri Lanka" }
      },
      {
        name: "Lexus ES",
        brand: "Lexus",
        model: "ES",
        year: 2018,
        price: 4800000,
        rating: 4.6,
        mileage: 135000,
        image: "https://images.unsplash.com/photo-1542362567-b07e54358753?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Luxury Hybrid", "Smooth Ride", "Reliable"],
        fuelType: "Hybrid",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["luxury", "daily"],
        description: "Premium luxury sedan with hybrid efficiency.",
        condition: "Used - Good",
        available: true,
        category: "second-hand",
        location: { city: "Trincomalee", country: "Sri Lanka" }
      },
      {
        name: "Infiniti Q50",
        brand: "Infiniti",
        model: "Q50",
        year: 2021,
        price: 4100000,
        rating: 4.5,
        mileage: 180000,
        image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Twin Turbo", "AWD", "Luxury Sport"],
        fuelType: "Petrol",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["luxury", "sport"],
        description: "Sporty luxury sedan with powerful performance.",
        condition: "Used - Fair",
        available: true,
        category: "second-hand",
        location: { city: "Badulla", country: "Sri Lanka" }
      },

      // ==================== ORIGINAL 6 VEHICLES ====================
      {
        name: "Toyota Camry Hybrid",
        brand: "Toyota",
        model: "Camry",
        year: 2024,
        price: 3200000,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1525609000669-f58aa0432ef3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Advanced Safety Assist", "Eco Mode 25km/L", "Premium Interior"],
        fuelType: "Hybrid",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["daily", "family"],
        description: "Perfect blend of luxury and efficiency for daily commute.",
        condition: "New",
        available: true,
        category: "new"
      },
      {
        name: "Honda CR-V",
        brand: "Honda",
        model: "CR-V",
        year: 2024,
        price: 3500000,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1542748457-22a013c7b1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Spacious Interior", "AWD Available", "Honda Sensing Safety"],
        fuelType: "Petrol",
        transmission: "Automatic",
        vehicleType: "suv",
        usage: ["family", "weekend"],
        description: "Ideal family SUV with excellent safety features.",
        condition: "New",
        available: true,
        category: "new"
      },
      {
        name: "Mazda3",
        brand: "Mazda",
        model: "Mazda3",
        year: 2024,
        price: 2800000,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Sporty Design", "SkyActiv Technology", "Premium Audio"],
        fuelType: "Petrol",
        transmission: "Automatic",
        vehicleType: "hatchback",
        usage: ["daily"],
        description: "Stylish and efficient city car with sporty handling.",
        condition: "New",
        available: true,
        category: "new"
      },
      {
        name: "Subaru Outback",
        brand: "Subaru",
        model: "Outback",
        year: 2024,
        price: 4200000,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Symmetrical AWD", "EyeSight Safety", "High Ground Clearance"],
        fuelType: "Diesel",
        transmission: "AWD",
        vehicleType: "suv",
        usage: ["weekend", "adventure"],
        description: "Rugged adventure vehicle with legendary AWD capability.",
        condition: "New",
        available: true,
        category: "new"
      },
      {
        name: "Tesla Model 3",
        brand: "Tesla",
        model: "Model 3",
        year: 2024,
        price: 5500000,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1591227458211-1c073b5e4f3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["Autopilot", "Electric Powertrain", "Long Range 500km"],
        fuelType: "Electric",
        transmission: "Automatic",
        vehicleType: "sedan",
        usage: ["daily", "eco"],
        description: "Revolutionary electric sedan with cutting-edge technology.",
        condition: "New",
        available: true,
        category: "new"
      },
      {
        name: "Ford Ranger",
        brand: "Ford",
        model: "Ranger",
        year: 2024,
        price: 4800000,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        features: ["4x4 Capability", "Towing Package", "Cargo Bed"],
        fuelType: "Diesel",
        transmission: "Automatic",
        vehicleType: "truck",
        usage: ["work", "weekend"],
        description: "Versatile pickup truck for work and adventure.",
        condition: "New",
        available: true,
        category: "new"
      }
    ];

    // Insert vehicles
    const createdVehicles = await Vehicle.insertMany(vehicles);
    console.log(`Seeded ${createdVehicles.length} vehicles successfully...!`);
    
    // Display breakdown by category
    const vehicleCategories = createdVehicles.reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n=== Vehicle Database Summary ===');
    Object.entries(vehicleCategories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} vehicles`);
    });

    // Seed Spare Parts
    console.log('\n---Seeding spare parts...');
    await SparePart.deleteMany({});
    
    const spareParts = [
      {
        name: "Engine Oil Filter",
        compatibleVehicle: "Universal",
        price: 2500,
        originalPrice: 3000,
        discount: 17,
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Engine Parts",
        description: "High-quality oil filter for engine protection",
        stock: 50,
        rating: 4.5,
        available: true
      },
      {
        name: "LED Headlights",
        compatibleVehicle: "BMW X5/X6",
        price: 15000,
        originalPrice: 20000,
        discount: 25,
        image: "https://images.unsplash.com/photo-1595943954646-5a1d2bf81d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Lighting",
        description: "Premium LED headlight conversion kit",
        stock: 20,
        rating: 4.7,
        available: true
      },
      {
        name: "Performance Tires",
        compatibleVehicle: "Various Models",
        price: 20000,
        originalPrice: 25000,
        discount: 20,
        image: "https://images.unsplash.com/photo-1595943954646-5a1d2bf81d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Wheels & Tires",
        description: "High-performance tires for enhanced grip",
        stock: 30,
        rating: 4.6,
        available: true
      },
      {
        name: "Brake Pads Set",
        compatibleVehicle: "Toyota Camry",
        price: 8000,
        originalPrice: 10000,
        discount: 20,
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Brake System",
        description: "Ceramic brake pads for superior stopping power",
        stock: 40,
        rating: 4.8,
        available: true
      },
      {
        name: "Air Intake System",
        compatibleVehicle: "Ford Mustang",
        price: 35000,
        originalPrice: 40000,
        discount: 13,
        image: "https://images.unsplash.com/photo-1595943954646-5a1d2bf81d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Performance",
        description: "Cold air intake for improved horsepower",
        stock: 15,
        rating: 4.9,
        available: true
      },
      {
        name: "Exhaust System",
        compatibleVehicle: "Honda Civic",
        price: 45000,
        originalPrice: 50000,
        discount: 10,
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Performance",
        description: "Cat-back exhaust system for better flow",
        stock: 10,
        rating: 4.7,
        available: true
      }
    ];

    const createdSpareParts = await SparePart.insertMany(spareParts);
    console.log(`Seeded ${createdSpareParts.length} spare parts successfully...!`);

    // Seed Modifications
    console.log('\nSeeding modifications...');
    await Modification.deleteMany({});
    
    const modifications = [
      {
        name: "Alloy Wheels",
        category: "Exterior",
        price: 120000,
        image: "https://images.unsplash.com/photo-1595943954646-5a1d2bf81d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Premium 20-inch alloy wheels for enhanced appearance",
        compatibleVehicles: ["Universal"],
        brand: "BBS",
        installationIncluded: true,
        warranty: "2 years",
        rating: 4.8,
        available: true
      },
      {
        name: "Body Kit",
        category: "Exterior",
        price: 250000,
        image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Complete aerodynamic body kit with front splitter and rear diffuser",
        compatibleVehicles: ["BMW 3 Series", "BMW 5 Series"],
        brand: "M Performance",
        installationIncluded: false,
        warranty: "1 year",
        rating: 4.9,
        available: true
      },
      {
        name: "LED Strip Lights",
        category: "Interior",
        price: 15000,
        image: "https://images.unsplash.com/photo-1595943954646-5a1d2bf81d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "RGB LED strip lights for customizable interior ambiance",
        compatibleVehicles: ["Universal"],
        brand: "Philips",
        installationIncluded: false,
        warranty: "6 months",
        rating: 4.5,
        available: true
      },
      {
        name: "Performance Seats",
        category: "Interior",
        price: 80000,
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Sport seats with enhanced support and premium materials",
        compatibleVehicles: ["Universal"],
        brand: "Recaro",
        installationIncluded: true,
        warranty: "3 years",
        rating: 4.9,
        available: true
      },
      {
        name: "Turbocharger",
        category: "Performance",
        price: 350000,
        image: "https://images.unsplash.com/photo-1595943954646-5a1d2bf81d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "High-performance turbocharger for increased power output",
        compatibleVehicles: ["Subaru WRX", "Mitsubishi Lancer"],
        brand: "Garrett",
        installationIncluded: true,
        warranty: "2 years",
        rating: 5.0,
        available: true
      },
      {
        name: "Suspension Kit",
        category: "Performance",
        price: 180000,
        image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Adjustable suspension kit for improved handling",
        compatibleVehicles: ["Honda Civic", "Toyota Corolla"],
        brand: "KW",
        installationIncluded: true,
        warranty: "2 years",
        rating: 4.8,
        available: true
      }
    ];

    const createdModifications = await Modification.insertMany(modifications);
    console.log(`Seeded ${createdModifications.length} modifications successfully...!`);
    
    // Final summary
    console.log('\n--- Complete Database Summary:');
    console.log(`   Total Vehicles: ${createdVehicles.length}`);
    console.log(`   Total Spare Parts: ${createdSpareParts.length}`);
    console.log(`   Total Modifications: ${createdModifications.length}`);
    console.log(`   Database seeding completed successfully...!`);

    const adminEmail = 'admin@mototrade.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Moto Trade Admin',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin'
      });
      console.log('\nCreated default admin user for unified login:');
      console.log(`   Email: ${adminEmail}`);
      console.log('   Password: Admin@123 (change after first login in production)');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
