// src/App.js
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Projects from "./pages/Projects";
import Checkout from "./pages/Checkout";
import Wallet from "./pages/Wallet";

function App() {
  return (
    <BrowserRouter>
      <nav className="p-3 bg-gray-800 text-white flex gap-4">
        <Link to="/">Loyihalar</Link>
        <Link to="/checkout">Checkout</Link>
        <Link to="/wallet">Wallet</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Projects />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;