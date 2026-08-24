import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import { AuthProvider } from "./context/AuthContext";

import Place from "./components/features/PlaceCard/Place";
import { AuthForm } from "./components/features/Auth/AuthForm";
import { ResetPassword } from "./components/features/Auth/ResetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import Layout from "./Layout";
import NotFound from "./pages/NotFound/NotFound";

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

function App() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const routers = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: (
            <Home
              favorites={favorites}
              setFavorites={setFavorites}
            />
          ),
        },

        {
          path: "destinations",
          element: <ExploreDestinations />,
        },

        {
          path: "place",
          element: (
            <Place
              favorites={favorites}
              setFavorites={setFavorites}
            />
          ),
        },

        {
          path: "details/:id",
          element: <DestinationDetails />,
        },

        {
          path: "favorites",
          element: (
            <ProtectedRoute>
              <Favorites
                favorites={favorites}
                setFavorites={setFavorites}
              />
            </ProtectedRoute>
          ),
        },

        {
          path: "trip-creation",
          element: <TripCreation />,
        },

        {
          path: "my-trips",
          element: <MyTrips />,
        },

        {
          path: "edit-trip/:id",
          element: <EditTrip />,
        },

        {
          path: "profile",
          element: <Profile />,
        },

        {
          path: "about",
          element: <About />,
        },

        {
          path: "contact",
          element: <Contact />,
        },

        {
          path: "view-trip/:tripId",
          element: <ViewTrip />,
        },

        {
          path: "login",
          element: (
            <PublicRoute>
              <AuthForm initialTab="login" />
            </PublicRoute>
          ),
        },

        {
          path: "register",
          element: (
            <PublicRoute>
              <AuthForm initialTab="register" />
            </PublicRoute>
          ),
        },

        {
          path: "reset-password",
          element: (
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          ),
        },

        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={routers} />
    </AuthProvider>
  );
}

export default App;