# 🚀 Moto Trade - Complete Setup Guide

## 📋 What You Have Now

A **full-stack vehicle marketplace** application with:
- ✅ **Frontend**: React + Vite + Tailwind CSS
- ✅ **Backend**: Node.js + Express + MongoDB
- ✅ **AI Integration**: Google Gemini API for smart recommendations

---

## 🎯 Quick Start (3 Easy Steps)

### Step 1: Install MongoDB

**Option A: Local MongoDB (Windows)**

1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically

**Option B: MongoDB Atlas (Cloud - Easier)**

1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a free cluster (M0 tier)
4. Get connection string
5. Update `server/.env` with your connection string

---

### Step 2: Install Dependencies

```bash
# Navigate to project root
cd "C:\Users\ASUS\Documents\MOTO TRADE"

# Install all dependencies (root + frontend + backend)
npm run install-all
```

---

### Step 3: Run Everything! 🚀

**Option 1: Run Both Together (Recommended)**

```bash
npm run dev
```

This starts BOTH frontend and backend simultaneously in one terminal!

**Option 2: Run Separately (For Debugging)**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd "MOTO TRADE"
npm run dev
```

---

### Step 4: Seed Database (First Time Only)

Populate your database with sample vehicles:

```bash
npm run seed
```

You should see:
```
✅ Connected to MongoDB
🗑️  Cleared existing vehicles
✅ Seeded 6 vehicles successfully
```

---

### Step 5: Open Your App

Open browser to: **http://localhost:5173**

Test the backend API: **http://localhost:5000/api/health**

---

## 📁 Project Structure

```
MOTO TRADE/
├── MOTO TRADE/              # Frontend (React App)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── config/          # Configuration files
│   │   └── data/            # Static data
│   ├── index.html
│   └── package.json
│
├── server/                  # Backend (Express API)
│   ├── config/              # Database config
│   ├── controllers/         # Business logic
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Error handling
│   ├── .env                 # Environment variables
│   └── index.js             # Server entry point
│
└── package.json             # Root package (runs both)
```

---

## 🔌 API Endpoints

Once running, test these URLs in your browser:

### Health Check
```
GET http://localhost:5000/api/health
```

### Get All Vehicles
```
GET http://localhost:5000/api/vehicles
```

### Search Vehicles
```
GET http://localhost:5000/api/vehicles/search?brand=Toyota&vehicleType=suv
```

### Statistics
```
GET http://localhost:5000/api/vehicles/stats/overview
```

---

## ⚙️ Configuration Files

### Backend: `server/.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/moto-trade
FRONTEND_URL=http://localhost:5173
```

### Frontend: `src/config/apiConfig.js`

Already configured with:
```javascript
BACKEND_API_URL: 'http://localhost:5000/api'
GEMINI_API_KEY: 'your-api-key'
```

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed

**Solution:**
1. Check if MongoDB is running:
   ```bash
   # Windows
   net start MongoDB
   
   # Or check services.msc
   ```

2. For MongoDB Atlas:
   - Check internet connection
   - Verify username/password
   - Add your IP to whitelist

---

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change port in `server/.env`:
   ```env
   PORT=5001
   ```

2. Update frontend config:
   ```javascript
   BACKEND_API_URL: 'http://localhost:5001/api'
   ```

---

### Issue: CORS Errors

**Solution:**
1. Ensure backend is running on port 5000
2. Ensure frontend is running on port 5173
3. Check `server/.env` has correct FRONTEND_URL

---

### Issue: Frontend Can't Connect to Backend

**Checklist:**
- ✅ Backend server is running (check terminal)
- ✅ MongoDB is connected (look for ✅ MongoDB Connected message)
- ✅ Correct API URL in frontend config
- ✅ No firewall blocking localhost connections

---

## 🧪 Testing the Full System

### Test 1: View Vehicles

1. Open http://localhost:5173
2. Navigate to any car listing page
3. Should see vehicles from database (not static data)

### Test 2: AI Recommendations

1. Go to AI Suggestion page
2. Set your preferences
3. Click "Find My Ideal Match"
4. Should get AI-powered recommendations

### Test 3: API Directly

Open browser to:
```
http://localhost:5000/api/vehicles
```

Should return JSON with all vehicles.

---

## 📊 Database Management

### View Database (Optional)

Install MongoDB Compass (GUI):
1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Database name: `moto-trade`
4. Collection: `vehicles`

### Clear Database

```bash
npm run seed
```

This clears and reseeds the database.

---

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)

1. Build: `npm run build` (in MOTO TRADE folder)
2. Deploy `dist` folder to Vercel/Netlify

### Backend (Railway/Render)

1. Push `server` folder to GitHub
2. Deploy to Railway/Render
3. Set environment variables

### Database (MongoDB Atlas)

Use MongoDB Atlas cloud database (free tier available).

---

## 📝 Available Scripts

From project root:

```bash
# Run both frontend & backend
npm run dev

# Run only backend
npm run server

# Run only frontend
npm run client

# Install all dependencies
npm run install-all

# Seed database
npm run seed
```

From server folder:

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# Seed database
npm run seed
```

From frontend folder:

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎓 Learning Resources

### MongoDB
- https://mongoosejs.com/docs/guide.html
- https://www.mongodb.com/docs/manual/introduction/

### Express.js
- https://expressjs.com/en/guide/routing.html
- https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs

### React + API Integration
- https://react.dev/reference/react/useEffect
- https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

---

## ✅ Success Checklist

After setup, you should have:

- ✅ MongoDB running (local or cloud)
- ✅ Backend server on port 5000
- ✅ Frontend server on port 5173
- ✅ 6 vehicles in database
- ✅ API responding at `/api/vehicles`
- ✅ Frontend displaying vehicles from database
- ✅ AI suggestions working

---

## 🎉 You're All Set!

Your full-stack vehicle marketplace is ready to use!

**Next Steps:**
1. Explore the app at http://localhost:5173
2. Test different features
3. Customize as needed
4. Add more vehicles via database

**Questions?** Check the README files in each folder for detailed documentation.

---

**Happy Coding! 🚗💨**
