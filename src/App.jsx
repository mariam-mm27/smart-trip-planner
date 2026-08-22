import { useState } from "react";
// import { BrowserRouter, Routes, Route, Router } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";

// Context
import { AuthProvider } from "./context/AuthContext";

// Components & Features
import Place from "./components/features/PlaceCard/Place";
import { AuthForm } from "./components/features/Auth/AuthForm";
import { ResetPassword } from "./components/features/Auth/ResetPassword";
import Navbar from "./components/common/Navbar";

// Routes & Route Guards
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

// Pages
import Home from "./pages/Home";
import DestinationDetails from "./pages/DestinationDetails";
import ExploreDestinations from "./pages/ExploreDestinations";
import Favorites from "./pages/Favorites/Favorites";
import TripCreation from "./pages/TripCreation/TripCreation";
import MyTrips from "./pages/MyTrips/MyTrips";
import EditTrip from "./pages/EditTrip/EditTrip";
import Profile from "./pages/Profile/Profile";
import Layout from "./Layout";
import NotFound from "./pages/NotFound/NotFound";


let routers = createBrowserRouter([
  {
    path: '/', element:<Layout/> , children:[
      {index: true,
        element: <Home />
      },
      {
        path: "destinations",
        element: <ExploreDestinations />,
      },
      {
        path: "place",
        element: <Place />,
      },

      {
        path: "destination/:id",
        element: <DestinationDetails />,
      },

      {
        path: "favorites",
        element: <Favorites />,
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
        path: '*',
        element:<NotFound/>
      }

    ]
  }
])
function App() {
  const [favorites, setFavorites] = useState([]);

  return<>
    <AuthProvider>
      <RouterProvider router={routers} />
    </AuthProvider>
  
  </>

  // return (
  //   <AuthProvider>
  //     <BrowserRouter>
  //       {/* <Navbar /> */}

  //       <Routes>
  //         Public Pages Accessible to All
          
  //         <Route path="/" element={<Navbar />} 
          
  //         />

  //         <Route path="/" element={<Home />} />
  //         <Route path="/explore" element={<ExploreDestinations />} />
  //         <Route path="/explore/:id" element={<DestinationDetails />} />
  //         <Route
  //           path="/places"
  //           element={
  //             <Place favorites={favorites} setFavorites={setFavorites} />
  //           }
  //         />
  //         <Route
  //           path="/favorites"
  //           element={
  //             <ProtectedRoute>
  //               <Favorites favorites={favorites} setFavorites={setFavorites} />
  //             </ProtectedRoute>
  //           }
  //         />

  //         {/* Auth-Only Public Routes */}
  //         <Route
  //           path="/login"
  //           element={
  //             <PublicRoute>
  //               <AuthForm initialTab="login" />
  //             </PublicRoute>
  //           }
  //         />
  //         <Route
  //           path="/register"
  //           element={
  //             <PublicRoute>
  //               <AuthForm initialTab="register" />
  //             </PublicRoute>
  //           }
  //         />
  //         <Route
  //           path="/reset-password"
  //           element={
  //             <PublicRoute>
  //               <ResetPassword />
  //             </PublicRoute>
  //           }
  //         />

  //         {/* Protected User Routes */}
  //         <Route
  //           path="/profile"
  //           element={
  //             <ProtectedRoute>
  //               <Profile />
  //             </ProtectedRoute>
  //           }
  //         />
  //         <Route
  //           path="/create-trip"
  //           element={
  //             <ProtectedRoute>
  //               <TripCreation />
  //             </ProtectedRoute>
  //           }
  //         />
  //         <Route
  //           path="/my-trips"
  //           element={
  //             <ProtectedRoute>
  //               <MyTrips />
  //             </ProtectedRoute>
  //           }
  //         />
  //         <Route
  //           path="/edit-trip/:tripId"
  //           element={
  //             <ProtectedRoute>
  //               <EditTrip />
  //             </ProtectedRoute>
  //           }
  //         />
  //       </Routes>
  //     </BrowserRouter>
  //   </AuthProvider>
  // );
}

export default App;