import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  async function registerUser(name, email, password, navigate, fetchSong) {
    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        "/api/user/register",
        {
          name,
          email,
          password,
        },
        { withCredentials: true }
      );

      setUser(data.user);
      setIsAuth(true);
      setBtnLoading(false);
      navigate("/");
      fetchSong();
    } catch (error) {
      console.log(error);
      setBtnLoading(false);
    }
  }

  async function loginUser(email, password, navigate, fetchSong) {
    setBtnLoading(true);
    try {
      await axios.post("/api/user/login", { email, password });
      await fetchUser();
      setBtnLoading(false);
      navigate("/");
      fetchSong();
    } catch (error) {
      console.log(error);
      setBtnLoading(false);
    }
  }

  async function fetchUser() {
    try {
      const { data } = await axios.get("/api/user/me");
      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setIsAuth(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        registerUser,
        user,
        isAuth,
        btnLoading,
        loading,
        loginUser,
        fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);
