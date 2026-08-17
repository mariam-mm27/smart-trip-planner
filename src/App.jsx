import { useState } from "react";
import Place from "./components/features/PlaceCard/Place";
import PlaceCard from "./components/features/PlaceCard/PlaceCard";
import Favorites from "./pages/Favorites/Favorites";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import TripCreation from "./pages/TripCreation/TripCreation";

function App() {
  const [favorites, setFavorites] = useState([]);

  return (
    <>
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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
