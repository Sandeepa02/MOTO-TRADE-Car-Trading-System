🚗 Moto Trade – Premium Vehicle Marketplace

Moto Trade is a full-stack web application designed as a modern vehicle marketplace where users can explore, buy, and sell vehicles, spare parts, and modifications.
It combines a clean UI, role-based dashboards, and AI-powered recommendations to enhance user experience.

🌟 Key Features

🌐 Public Access

Browse branded cars and second-hand vehicles
Explore spare parts and modifications
Advanced filtering (price, fuel type, category, etc.)

Detailed vehicle pages

👤 Authenticated Users

🔐 Secure JWT authentication

🤖 AI-powered vehicle suggestions (Google Gemini)

🛒 Cart & checkout (bank transfer style)

💬 Buyer–seller chat system (localStorage-based)

⭐ Reviews, ratings & complaint system

👤 User profile with:

Purchase history

Notifications

Payments

Activity tracking

🧑‍💼 Seller Dashboard

Add and manage listings

Handle second-hand vehicle sales
Track user interactions

🛠️ Admin Panel

Full system control with separate UI

Manage:

Vehicles

Spare parts

Modifications

Monitor payments & system activity

🧱 Tech Stack

Layer	Technology

Frontend	React 18, Vite, Tailwind CSS

Backend	Node.js, Express

Database	MongoDB (Mongoose)

Auth	JWT, bcrypt

AI	Google Gemini API

Tools	Axios, jsPDF

📁 Project Structure

MOTO TRADE/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── config/
│   │   └── utils/
│   └── package.json
│
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── package.json
│
└── README.md

⚙️ Setup Instructions
1️⃣ Install Dependencies
# Backend
cd Backend
npm install

# Frontend
cd Frontend
npm install
2️⃣ Configure Environment Variables

Create .env in Backend:

MONGODB_URI=mongodb://127.0.0.1:27017/moto-trade
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
3️⃣ Seed Database (Optional)
npm run seed
4️⃣ Create Admin User
npm run create-admin
5️⃣ Run the Project
# Backend
npm run dev

# Frontend
npm run dev
🔗 API Overview
Method	Endpoint	Description
GET	/api/health	Server status
POST	/api/auth/register	Register user
POST	/api/auth/login	Login
GET	/api/vehicles	Get all vehicles
GET	/api/vehicles/:id	Vehicle details
🤖 AI Integration
Powered by Google Gemini API
Provides personalized vehicle recommendations
Uses user preferences + internal dataset
🔐 Security Notes
Store secrets in .env only
Never expose API keys in frontend
Use HTTPS in production
Prefer backend proxy for AI requests
📌 Future Improvements
Online payment gateway integration
Real-time chat (WebSockets)
Image upload via cloud storage
Advanced analytics dashboard
📜 License

This project is licensed under the ISC License.

👨‍💻 Author

Developed by Suraj Sandeepa

💡 What I Improved (so you understand)
Cleaner section hierarchy
Removed overly long explanations
Made it more portfolio-ready
Added future improvements (important for grading)
Improved readability with icons + spacing

If you want next level upgrade, I can also:

🔥 Add badges (GitHub style)
🎨 Improve README design with screenshots section
📊 Add architecture diagram
📦 Create professional GitHub portfolio version

Just tell me 👍
