import "./App.scss";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./SignUp.scss";
import Signup from "./SignUp";
import Signin from "./Signin";
import Nifty50 from "./home";
import orders from "../src/component/buycard";
import OrderBook from "./OrderBook";
import "bootstrap/dist/css/bootstrap.min.css";
import FinNifty from "./FinNifty";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/OrderBook" element={<OrderBook orders={orders} />} />
        <Route path="/finifty" element={<FinNifty />} />
        <Route path="/home" element={<Nifty50 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
