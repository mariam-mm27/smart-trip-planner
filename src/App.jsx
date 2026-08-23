import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Context
import { AuthProvider } from "./context/AuthContext";

// Components & Features
import Place from "./components/features/PlaceCard/Place";
import { AuthForm } from "./components/features/Auth/AuthForm";
import { ResetPassword } from "./components/features/Auth/ResetPassword";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Routes & Route Guards
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AdminRoute from "./routes/AdminRoute";

// Pages
import Home from "./pages/Home";
import DestinationDetails from "./pages/DestinationDetails";
import ExploreDestinations from "./pages/ExploreDestinations";
import Favorites from "./pages/Favorites/Favorites";
import TripCreation from "./pages/TripCreation/TripCreation";
import MyTrips from "./pages/MyTrips/MyTrips";
import EditTrip from "./pages/EditTrip/EditTrip";
import Profile from "./pages/Profile/Profile";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import ViewTrip from "./pages/ViewTrip/ViewTrip";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminMessages from "./pages/Admin/AdminMessages";
import NotFound from "./pages/NotFound";

function App() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Shell (logo + theme/language/profile only, no site nav or footer) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>

          {/* Public Shell (Navbar + Footer) */}
          <Route element={<PublicLayout />}>
            {/* Public Pages Accessible to All */}
            <Route
              path="/"
              element={
                <Home favorites={favorites} setFavorites={setFavorites} />
              }
            />
            <Route
              path="/explore"
              element={
                <ExploreDestinations
                  favorites={favorites}
                  setFavorites={setFavorites}
                />
              }
            />
            <Route path="/details/:id" element={<DestinationDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/places"
              element={
                <Place favorites={favorites} setFavorites={setFavorites} />
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites
                    favorites={favorites}
                    setFavorites={setFavorites}
                  />
                </ProtectedRoute>
              }
            />

            {/* Auth-Only Public Routes (Redirect authenticated users away) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthForm initialTab="login" />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <AuthForm initialTab="register" />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* Protected User Routes (Require Authenticated User) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-trip"
              element={
                <ProtectedRoute>
                  <TripCreation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-trips"
              element={
                <ProtectedRoute>
                  <MyTrips />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-trip/:tripId"
              element={
                <ProtectedRoute>
                  <EditTrip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-trip/:tripId"
              element={
                <ProtectedRoute>
                  <ViewTrip />
                </ProtectedRoute>
              }
            />

            {/* Catch-all for unknown URLs */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
