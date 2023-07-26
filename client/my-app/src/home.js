import React, { useEffect, useState } from "react";
import "./home.css";
import Sidebar from "./component/sidebar";
import Buycard from "./component/buycard";
import Sellcard from "./component/sellcard";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bullImage from "./bull.png";
import bearImage from "./bear.png";
import TableComponent from "./component/TableComponent";
const Nifty50 = () => {
  const [lastTradedPrice, setLastTradedPrice] = useState(null);
  const [pnlfromce, setPnlFromCe] = useState(null);

  // Callback function to receive data from the child component
  const handlePnlFromCe = (cepnl) => {
    setPnlFromCe(cepnl);
  };

  /* getting the accesstoken from server */

  async function handleGenerateAccess() {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/getAccessToken/"
      );
      toast.success(response.data);
    } catch (error) {
      toast.error(error);
    }
  }

  const fetchLastTradedPrice = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/last_traded_price/"
      );
      setLastTradedPrice(response.data.latest_price);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Fetch initial last traded price from the backend
    fetchLastTradedPrice();

    // Start polling at a specified interval (e.g., every 5 seconds)
    const intervalId = setInterval(fetchLastTradedPrice, 1000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const closeAllPosition = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/close_all/");
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <img src={bullImage} alt="bull" className="bullpic" />
      <img src={bearImage} alt="bear" className="bearpic" />
      <section className="home-section">
        <div className="ltp">
          <h2 className="ltpheading">NIFTY50</h2>
          <h2 className="ltpview">{lastTradedPrice}</h2>
          <h2 className="totalpnl">TOTAL PNL:{pnlfromce}</h2>
        </div>

        <Buycard
          lastTradedPrice={lastTradedPrice}
          onPnlFromCeUpdate={handlePnlFromCe}
        />
        <Sellcard lastTradedPrice={lastTradedPrice} />
        <button className="closepl" onClick={closeAllPosition}>
          CLOSE/PL
        </button>

        <button className="cancelor">CANCEL/OR</button>
        <button className="generate_access" onClick={handleGenerateAccess}>
          TOKEN
        </button>

        <h2 className="pushing">PUSHING</h2>
        <h2 className="pulling">PULLING</h2>
      </section>
      <div>
        <TableComponent />
      </div>

      <Sidebar />
    </div>
  );
};

export default Nifty50;
