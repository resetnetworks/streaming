import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./user/Home";
import Browse from "./user/Browse";
import Login from "./user/Login";
import Register from "./user/Register";
import Search from "./user/Search";
import Library from "./user/Library";
import CreatePlayList from "./user/CreatePlayList";
import LikedSong from "./user/LikedSong";
import Help from "./user/Help";
import Admin from "./admin/Admin";
import { UserData } from "./context/User";
import Loader from "./components/Loader";

function App() {
  const { loading, isAuth } = UserData();
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isAuth ? <Home /> : <Login />} />
            <Route path="/login" element={isAuth ? <Home /> : <Login />} />
            <Route
              path="/register"
              element={isAuth ? <Home /> : <Register />}
            />
            <Route path="/browse" element={isAuth ? <Browse /> : <Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/create-playlist" element={<CreatePlayList />} />
            <Route path="/liked-songs" element={<LikedSong />} />
            <Route path="/help" element={<Help />} />
            <Route path="/admin" element={<Admin />} />
            
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
