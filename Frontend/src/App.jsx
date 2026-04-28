import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BrandedCars from './pages/BrandedCars';
import SecondHandCars from './pages/SecondHandCars';
import SpareParts from './pages/SpareParts';
import Modifications from './pages/Modifications';
import AISuggestion from './pages/AISuggestion';
import UserProfileDashboard from './pages/UserProfileDashboard';
import UserProfileForm from './pages/UserProfileForm';
import UserReviews from './pages/UserReviews';
import RecentPayments from './pages/RecentPayments';
import UserNotifications from './pages/UserNotifications';
import MyCart from './pages/MyCart';
import BrowsingHistory from './pages/BrowsingHistory';
import SellerDashboard from './pages/SellerDashboard';
import AddSecondHandListing from './pages/AddSecondHandListing';
import CarDetails from './pages/CarDetails';
import ChatDashboard from './pages/ChatDashboard';
import PaymentCheckout from './pages/PaymentCheckout';
import PurchaseFeedbackPage from './pages/PurchaseFeedbackPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminBrandedCarsDetail from './pages/admin/AdminBrandedCarsDetail';
import AdminSecondHandCarsDetail from './pages/admin/AdminSecondHandCarsDetail';
import AdminSparePartsDetail from './pages/admin/AdminSparePartsDetail';
import AdminModificationsDetail from './pages/admin/AdminModificationsDetail';
import AdminPaymentsReview from './pages/admin/AdminPaymentsReview';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

function AppShell() {
  const location = useLocation();
  const { isAdmin, isAuthenticated } = useAuth();
  const hideSiteChrome = isAdmin || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!hideSiteChrome && <Navbar />}
      <main className="flex-grow">
          <Routes>
            {/* Public routes - accessible without login */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/branded-cars" element={<BrandedCars />} />
            <Route path="/second-hand-cars" element={<SecondHandCars />} />
            <Route path="/car-details/:id" element={<CarDetails />} />
            <Route path="/spare-parts" element={<SpareParts />} />
            <Route path="/modifications" element={<Modifications />} />
            <Route path="/admin/chats" element={<Navigate to="/my-chats" replace />} />
            <Route
              path="/my-chats"
              element={
                <ProtectedRoute redirectMessage="Please login or register to use My Chats">
                  <ChatDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="branded-cars" element={<AdminBrandedCarsDetail />} />
              <Route path="second-hand-cars" element={<AdminSecondHandCarsDetail />} />
              <Route path="spare-parts" element={<AdminSparePartsDetail />} />
              <Route path="modifications" element={<AdminModificationsDetail />} />
              <Route path="payments" element={<AdminPaymentsReview />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>
            {isAdmin ? (
              <>
                <Route path="/login" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/register" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </>
            ) : (
              <>
                {/* Protected routes - require login */}
                <Route
                  path="/ai-suggestion" 
                  element={
                    <ProtectedRoute redirectMessage="Please login or register to use AI Suggestion">
                      <AISuggestion />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/payment/checkout"
                  element={
                    <ProtectedRoute redirectMessage="Please login to proceed with payment">
                      <PaymentCheckout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/purchase-feedback/:paymentId"
                  element={
                    <ProtectedRoute redirectMessage="Please login to submit review and complaint">
                      <PurchaseFeedbackPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-profile"
                  element={
                    <ProtectedRoute redirectMessage="Please login to access your profile">
                      <UserProfileDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-profile/details"
                  element={
                    <ProtectedRoute redirectMessage="Please login to update your profile">
                      <UserProfileForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-profile/reviews"
                  element={
                    <ProtectedRoute redirectMessage="Please login to access your reviews">
                      <UserReviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-profile/payments"
                  element={
                    <ProtectedRoute redirectMessage="Please login to access your payments">
                      <RecentPayments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-profile/notifications"
                  element={
                    <ProtectedRoute redirectMessage="Please login to access your notifications">
                      <UserNotifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-profile/cart"
                  element={
                    <ProtectedRoute redirectMessage="Please login to access your cart">
                      <MyCart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-profile/history"
                  element={
                    <ProtectedRoute redirectMessage="Please login to access your browsing history">
                      <BrowsingHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller-dashboard"
                  element={
                    <ProtectedRoute redirectMessage="Please login to become a seller">
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller-dashboard/add-listing"
                  element={
                    <ProtectedRoute redirectMessage="Please login to add a listing">
                      <AddSecondHandListing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller-dashboard/edit-listing/:listingId"
                  element={
                    <ProtectedRoute redirectMessage="Please login to edit a listing">
                      <AddSecondHandListing />
                    </ProtectedRoute>
                  }
                />
                <Route path="/seller-dashboard/chats" element={<Navigate to="/my-chats" replace />} />
                {isAuthenticated ? null : <Route path="*" element={<Home />} />}
              </>
            )}
          </Routes>
      </main>
      {!hideSiteChrome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;