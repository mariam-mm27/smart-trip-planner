import { useState } from "react";
import Place from "./components/features/PlaceCard/Place";
import PlaceCard from "./components/features/PlaceCard/PlaceCard";
import Favorites from "./pages/Favorites/Favorites";
import { AuthProvider } from './context/AuthContext';
import { AuthForm } from './components/features/Auth/AuthForm';
import { ResetPassword } from './components/features/Auth/ResetPassword';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";


function App() {
const isResetPasswordPath = window.location.pathname.startsWith('/reset-password');
  return (
    <AuthProvider>
<div className="auth-wrapper">
  {isResetPasswordPath ? <ResetPassword /> : <AuthForm />}
      </div>
    </AuthProvider>
  );
  const [favorites, setFavorites] = useState([]);
  return <>
  <BrowserRouter>
    <Link to="/favorites">Favorites</Link>
    <Routes>

      <Route
        path="/"
        element={
          <Place
            favorites={favorites}
            setFavorites={setFavorites}
          />
        }
      />

      <Route
        path="/favorites"
        element={
          <Favorites
            favorites={favorites}
            setFavorites={setFavorites}
          />
        }
      />

    </Routes>
  </BrowserRouter>
  
  </>

  
}

export default App;