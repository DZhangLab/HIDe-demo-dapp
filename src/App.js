import React from "react";
import ResponsiveAppBar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import About from "./pages/About";
import Main from "./pages/Main";
import Recovery from "./pages/Recovery";
import Admin from "./pages/Admin";
import Encrypt from "./pages/EncryptTest";

function App() {
  return (
    <>
      <ResponsiveAppBar></ResponsiveAppBar>
      <Routes>
        <Route path="/" element={<Navigate replace to="/About" />} />
        <Route path="/About" element={<About />} />
        <Route path="/Main" element={<Main />} />
        <Route path="/Recovery" element={<Recovery />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Encrypt" element={<Encrypt />} />
      </Routes>
    </>
  );
}

export default App;
