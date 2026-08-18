import Place from "./components/features/PlaceCard/Place";
import Favorites from "./pages/Favorites/Favorites";
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

function App() {

  return (
    <BrowserRouter>

      <Link to="/favorites">
        Favorites
      </Link>

      <Routes>

        <Route
          path="/"
          element={<Place />}
        />

        <Route
          path="/favorites"
          element={<Favorites />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;