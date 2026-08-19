import { useState } from "react";
import Place from "./components/features/PlaceCard/Place";
import PlaceCard from "./components/features/PlaceCard/PlaceCard";
import Favorites from "./pages/Favorites/Favorites";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import TripCreation from "./pages/TripCreation/TripCreation";
import MyTrips from "./pages/MyTrips/MyTrips";
import EditTrip from "./pages/EditTrip/EditTrip";

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
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/edit-trip/:tripId" element={<EditTrip />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
