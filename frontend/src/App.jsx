import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home.jsx";
import ShopDetails from "./pages/ShopDetails";
import Profile from "./pages/Profile";
import MyShopPage from "./pages/MyShop.jsx";
import EditShopPage from "./pages/EditShop.jsx";
import SearchResults from "./pages/SearchResult.jsx"; 
import FavouritePage from "./pages/Favourite.jsx";
import Explore from "./pages/Explore.jsx";
import FoodResults from "./pages/FoodResults.jsx";
import CategoryResults from "./pages/CategoryResults.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/shops/:id" element={<ShopDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-thela" element={<MyShopPage />} />
        <Route path="/shops/:id/edit" element={<EditShopPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/favourites" element={<FavouritePage />} />
        <Route path="/explore" element={<Explore />} />
<Route path="/food/:name" element={<FoodResults />} />
<Route path="/category/:name" element={<CategoryResults />} />



      </Routes>
    </BrowserRouter>
  );
}
