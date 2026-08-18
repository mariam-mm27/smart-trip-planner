import { useState } from "react";
import Place from "./components/features/PlaceCard/Place";
import PlaceCard from "./components/features/PlaceCard/PlaceCard";
import Favorites from "./pages/Favorites/Favorites";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from './pages/Home';
import DestinationDetails from "./pages/DestinationDetails";
import ExploreDestinations from "./pages/ExploreDestinations";

function App() {

  const [favorites, setFavorites] = useState([]);
  
  return <>
  <BrowserRouter>
    <Link to="/favorites">Favorites</Link>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/details/:id" element={<DestinationDetails />} />
      <Route path="/explore"  element={<ExploreDestinations />}/>
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