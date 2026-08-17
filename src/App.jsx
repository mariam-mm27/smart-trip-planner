import { useState } from "react";
import Place from "./components/features/PlaceCard/Place";
import PlaceCard from "./components/features/PlaceCard/PlaceCard";
import Favorites from "./pages/Favorites/Favorites";
import { AuthProvider } from './context/AuthContext';
import { AuthForm } from './components/features/Auth/AuthForm';
import { ResetPassword } from './components/features/Auth/ResetPassword';
import TripCreation from "./pages/TripCreation/TripCreation";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function App() {
  const [favorites, setFavorites] = useState([]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Link to="/favorites">Favorites</Link>
        <Routes>
          <Route
            path="/"
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
          <Route path="/create-trip" element={<TripCreation />} />
          
          {}
          <Route path="/login" element={<AuthForm />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;