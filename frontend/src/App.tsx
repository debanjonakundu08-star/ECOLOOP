import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { MaterialDetailPage } from './pages/MaterialDetailPage';
import { SellerAddListingPage } from './pages/SellerAddListingPage';
import { SellerListingsPage } from './pages/SellerListingsPage';
import { BuyerWishlistPage } from './pages/BuyerWishlistPage';
import { RequestMaterialPage } from './pages/RequestMaterialPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { SellerRequestsPage } from './pages/SellerRequestsPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { BuyerMarketplacePage } from './pages/BuyerMarketplacePage';
import { BuyerRequestsPage } from './pages/BuyerRequestsPage';
import { MessagingPage } from './pages/MessagingPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ImpactDashboardPage } from './pages/ImpactDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditListingPage } from './pages/EditListingPage';
import { ContactPage } from './pages/ContactPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RootGateway } from './components/RootGateway';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg text-slate-800 dark:text-slate-100 transition-colors duration-300">
              <Navbar />
              <main className="flex-1">
                <ErrorBoundary>
                  <Routes>
                    {/* Entry Route: Role Selection Gateway or Direct Role Dashboard */}
                    <Route path="/" element={<RootGateway />} />
                    <Route path="/landing" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/auth" element={<Navigate to="/login" replace />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/materials/:id" element={<MaterialDetailPage />} />
                    <Route path="/impact" element={<ImpactDashboardPage />} />

                    {/* Dedicated Buyer Routes */}
                    <Route
                      path="/buyer/marketplace"
                      element={
                        <RoleRoute allowedRole="BUYER">
                          <BuyerMarketplacePage />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/buyer/dashboard"
                      element={
                        <RoleRoute allowedRole="BUYER">
                          <BuyerDashboardPage />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/buyer/wishlist"
                      element={
                        <RoleRoute allowedRole="BUYER">
                          <BuyerWishlistPage />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/buyer/requests"
                      element={
                        <RoleRoute allowedRole="BUYER">
                          <BuyerRequestsPage />
                        </RoleRoute>
                      }
                    />
                    <Route path="/buyer" element={<Navigate to="/buyer/marketplace" replace />} />
                    <Route path="/explore" element={<Navigate to="/buyer/marketplace" replace />} />

                    {/* Dedicated Seller Routes */}
                    <Route
                      path="/seller/dashboard"
                      element={
                        <RoleRoute allowedRole="SELLER">
                          <SellerDashboardPage />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/seller/listings"
                      element={
                        <RoleRoute allowedRole="SELLER">
                          <SellerListingsPage />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/seller/list-waste"
                      element={
                        <RoleRoute allowedRole="SELLER">
                          <SellerAddListingPage />
                        </RoleRoute>
                      }
                    />
                    <Route path="/seller/add-listing" element={<Navigate to="/seller/list-waste" replace />} />
                    <Route
                      path="/seller/requests"
                      element={
                        <RoleRoute allowedRole="SELLER">
                          <SellerRequestsPage />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/materials/:id/edit"
                      element={
                        <RoleRoute allowedRole="SELLER">
                          <EditListingPage />
                        </RoleRoute>
                      }
                    />
                    <Route
                      path="/edit/:id"
                      element={
                        <RoleRoute allowedRole="SELLER">
                          <EditListingPage />
                        </RoleRoute>
                      }
                    />
                    <Route path="/seller" element={<Navigate to="/seller/listings" replace />} />

                    {/* Redirects & Legacy paths */}
                    <Route path="/list-waste" element={<Navigate to="/seller/list-waste" replace />} />

                    {/* Shared Authenticated Routes */}
                    <Route
                      path="/request/:id"
                      element={
                        <ProtectedRoute>
                          <RequestMaterialPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <MessagingPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/:id"
                      element={
                        <ProtectedRoute>
                          <OrderDetailsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/checkout/:id"
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ErrorBoundary>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
