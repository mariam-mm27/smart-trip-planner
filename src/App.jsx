import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components & Features
import Place from "./components/features/PlaceCard/Place";
import PlaceCard from "./components/features/PlaceCard/PlaceCard";
import { AuthForm } from './components/features/Auth/AuthForm';
import { ResetPassword } from './components/features/Auth/ResetPassword';

// Pages
import Home from './pages/Home';
import DestinationDetails from "./pages/DestinationDetails";
import ExploreDestinations from "./pages/ExploreDestinations";
import Favorites from "./pages/Favorites/Favorites";
import TripCreation from "./pages/TripCreation/TripCreation";

function App() {
  const [favorites, setFavorites] = useState([]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <nav>
          <Link to="/">Home</Link> |{" "}
          <Link to="/explore">Explore</Link> |{" "}
          <Link to="/places">Places</Link> |{" "}
          <Link to="/favorites">Favorites</Link>
        </nav>

        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<ExploreDestinations />} />
          <Route path="/details/:id" element={<DestinationDetails />} />
          
          {/* Places & Favorites */}
          <Route
            path="/places"
            element={
              <Place favorites={favorites} setFavorites={setFavorites} />
            }
          />
          <Route
            path="/favorites"
            element={
              <Favorites favorites={favorites} setFavorites={setFavorites} />
            }
          />
          
          {/* Trips & Authentication */}
          <Route path="/create-trip" element={<TripCreation />} />
          <Route path="/login" element={<AuthForm />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;