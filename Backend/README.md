# 🚗 Moto Trade Backend Server

Backend API for the Moto Trade vehicle marketplace application.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (Local installation or MongoDB Atlas cloud database)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file in this directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/moto-trade
FRONTEND_URL=http://localhost:5173
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moto-trade?retryWrites=true&w=majority
```

### 3. Start MongoDB (if using local installation)

**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 5. Seed Initial Data (Optional)

Populate the database with sample vehicles:

```bash
npm run seed
```

## 🔌 API Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```

### Vehicles

#### Get All Vehicles
```
GET http://localhost:5000/api/vehicles
```

#### Get Single Vehicle by ID
```
GET http://localhost:5000/api/vehicles/:id
```

#### Create New Vehicle
```
POST http://localhost:5000/api/vehicles
Content-Type: application/json

{
  "name": "Toyota Camry",
  "brand": "Toyota",
  "model": "Camry",
  "year": 2024,
  "price": 3200000,
  "fuelType": "Hybrid",
  "transmission": "Automatic",
  "vehicleType": "sedan"
}
```

#### Update Vehicle
```
PUT http://localhost:5000/api/vehicles/:id
```

#### Delete Vehicle
```
DELETE http://localhost:5000/api/vehicles/:id
```

#### Search Vehicles
```
GET http://localhost:5000/api/vehicles/search?brand=Toyota&vehicleType=sedan&minPrice=1000000&maxPrice=5000000
```

#### Get Statistics
```
GET http://localhost:5000/api/vehicles/stats/overview
```

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── vehicleController.js # Business logic
├── middleware/
│   └── errorHandler.js      # Error handling
├── models/
│   └── Vehicle.js           # Mongoose schema
├── routes/
│   └── vehicles.js          # API routes
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── index.js                # Server entry point
├── seed.js                 # Database seeding script
└── package.json            # Dependencies
```

## 🔧 Development Tips

### Testing API with cURL or Postman

**Get all vehicles:**
```bash
curl http://localhost:5000/api/vehicles
```

**Create a vehicle:**
```bash
curl -X POST http://localhost:5000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Car","brand":"Toyota","model":"Corolla","year":2024,"price":2500000,"fuelType":"Petrol","transmission":"Automatic","vehicleType":"sedan"}'
```

### Debugging

The server logs all requests in development mode:
```
GET /api/vehicles 200 15.234 ms - 1234
```

Check the console for error messages and database connection status.

## 🔐 Security Notes

- Never commit `.env` file to version control
- Use strong passwords for MongoDB Atlas
- Enable HTTPS in production
- Implement authentication for protected routes

## 📊 Database Schema

The Vehicle model includes:

- **Basic Info**: name, brand, model, year, price
- **Specifications**: fuelType, transmission, vehicleType
- **Features**: Array of feature strings
- **Condition**: New or Used (Excellent/Good/Fair)
- **Location**: city, state, country
- **Seller Info**: name, contact, email
- **Metadata**: rating, images, description, availability

## 🌐 Connecting Frontend

Update your frontend API configuration:

```javascript
// src/config/apiConfig.js
export const API_CONFIG = {
  BACKEND_API_URL: 'http://localhost:5000/api',
  // ... other config
};
```

Then fetch data:

```javascript
const response = await fetch(`${API_CONFIG.BACKEND_API_URL}/vehicles`);
const data = await response.json();
```

## 🚨 Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB is running
- Verify MONGODB_URI in `.env`
- For Atlas, check IP whitelist and credentials

### Port Already in Use
- Change PORT in `.env` to another port (e.g., 5001)
- Or kill the process using port 5000

### CORS Errors
- Ensure FRONTEND_URL matches your frontend's actual URL
- Check that cors middleware is properly configured

## 📝 License

ISC

## 👨‍💻 Author

Moto Trade Team

---

**Happy Coding! 🎉**
