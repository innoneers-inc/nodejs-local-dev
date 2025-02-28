import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import apis from "./apis";

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    apis
      .get("/auth/currentUser")
      .then(() => {
        setIsLoggedIn(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Gallery /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="*" element={<Navigate to="/gallery" />} />
      </Routes>
    </Router>
  );
};

export default App;
