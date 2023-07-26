import React, { useState, useEffect } from "react";
import "./BuyCardFinNifty.css";
import Quantity from "./Quantity";
import Options from "./Options";
import { formatDate } from "./helpers"; // Import formatDate function
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderBook from "../OrderBook";
import axios from "axios";

export default function Buycard({ lastTradedPrice }) {
  /* 
  use state initialization */
  const [strikePrices, setStrikePrices] = useState([]);
  const [niftybuyprice, setNiftyBuyPrice] = useState(null);
  const [niftystoplossprice, setNiftyStoplossPrice] = useState(null);
  const [niftycestoplossprice, setNiftyCeStoplossPrice] = useState(null);
  const [stoplossChecked, setStoplossChecked] = useState(false);
  const [cestoplossChecked, setCeStoplossChecked] = useState(false);
  const [trailingcestoplossChecked, setTrailingCeStoplossChecked] =
    useState(false);
  const [stoplossValue, setStoplossValue] = useState("");
  const [TrailingNIftyCEstoplossvalue, setTrailingNIftyCEstoplossvalue] =
    useState("");
  const [cestoplossValue, setCeStoplossValue] = useState("");
  const [trailcestoplossValue, setTrailCeStoplossValue] = useState("");
  const [isClicked, setIsClicked] = useState(false);
  const [lasttradedpriceforce, setLastTradedPriceForCe] = useState(null);
  const [optionsbuyprice, setOptionsBuyPrice] = useState("");
  const [optionspnl, setOptionsPnl] = useState("0");
  const [selectedstrikeprice, setSelectedStrikePrice] = useState(null);
  const [initialpricefortrail, setInitialPriceForTrail] = useState("");
  const [selectedceqty, setSelectedCeQty] = useState("");
  const [symbolceselected, setSymbolCeSelected] = useState("");

  /* for OrderBook */

  /* getting the thursday dates */
  function getNextThursdays() {
    const today = new Date();
    const daysUntilNextThursday = (4 - today.getDay() + 7) % 7;
    const nextThursdays = [];

    for (let i = 0; i < 3; i++) {
      const nextThursday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + daysUntilNextThursday + i * 7
      );
      nextThursdays.push(nextThursday);
    }

    return nextThursdays;
  }

  function renderOptions() {
    const nextThursdays = getNextThursdays();
    const options = nextThursdays.map((thursday) => (
      <option key={thursday.toISOString()} value={thursday.toISOString()}>
        {formatDate(thursday)}
      </option>
    ));
    return options;
  }

  /* getting strike prices from django */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/getStrike/");
      const strikePrices = response.data;

      setStrikePrices(strikePrices);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStrikeChange = (event) => {
    const selectedStrikePrice = event.target.value;
    setSelectedStrikePrice(selectedStrikePrice);
  };

  //fetching strike price ltp from django

  const fetchLastTradedPriceForCe = async () => {
    const symbol = generateSymbol(selectedstrikeprice);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/last_traded_price_ce/",
        { selectedstrike: symbol } //please remember to put symbol variable here
      );
      setLastTradedPriceForCe(response.data.latest_price);
    } catch (error) {
      console.log(error);
    }
  };

  /* using the 1 second fetching from server usage of websocket */
  useEffect(() => {
    // Fetch initial last traded price from the backend
    fetchLastTradedPriceForCe();

    // Start polling at a specified interval (e.g., every 5 seconds)
    const intervalId = setInterval(fetchLastTradedPriceForCe, 1000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [selectedstrikeprice]);

  // Function to generate the symbol to contact the server for executing buy/sell based on the given format

  const generateSymbol = (selectedstrikeprice) => {
    const selectedExpiryDate = document.getElementById("callstrike").value;
    const selectedstrikepricece = selectedstrikeprice;

    const expiryDate = new Date(selectedExpiryDate);
    const year = expiryDate.getFullYear().toString().substr(-2);
    const monthMap = {
      Jan: "1",
      Feb: "2",
      Mar: "3",
      Apr: "4",
      May: "5",
      Jun: "6",
      Jul: "7",
      Aug: "8",
      Sep: "9",
      Oct: "O",
      Nov: "N",
      Dec: "D",
    };
    const month =
      monthMap[expiryDate.toLocaleString("default", { month: "short" })];
    const day = expiryDate.getDate().toString().padStart(2, "0");

    return `NSE:NIFTY${year}${month}${day}${selectedstrikepricece}CE`;
  };

  /* calculating nifty50 stoploss price  */

  const calculateNiftyStoplossPrice = () => {
    if (niftybuyprice !== null && stoplossChecked) {
      const calculatedStoplossPrice = niftybuyprice - stoplossValue;
      setNiftyStoplossPrice(calculatedStoplossPrice);
    }
  };

  const handleStoplossChange = (event) => {
    setStoplossChecked(event.target.checked);
  };

  const handleStoplossValueChange = (event) => {
    setStoplossValue(event.target.value);
  };
  const handleClick = () => {
    calculateNiftyStoplossPrice();
  };

  useEffect(() => {
    if (
      stoplossChecked &&
      niftystoplossprice !== 0 &&
      niftystoplossprice !== null &&
      niftystoplossprice !== ""
    ) {
      toast.success("entered nifty stoploss");
      if (lastTradedPrice <= niftystoplossprice) {
        // Call your separate function here
        toast.success("successfull");
        handleSellBtClick();
        setNiftyStoplossPrice(null);
      }
    }
  }, [niftystoplossprice, lastTradedPrice, stoplossChecked]);

  /* calculating opyions ce stoploss price  */

  const calculateNiftyCEStoplossPrice = () => {
    if (
      optionsbuyprice !== null &&
      cestoplossChecked &&
      !trailingcestoplossChecked
    ) {
      const calculatedNiftyCEStoplossPrice = cestoplossValue;
      setNiftyCeStoplossPrice(calculatedNiftyCEStoplossPrice);
    }
  };
  useEffect(() => {
    if (
      cestoplossChecked &&
      niftycestoplossprice !== 0 &&
      niftycestoplossprice !== null &&
      niftycestoplossprice !== "" &&
      !trailingcestoplossChecked
    ) {
      toast.success("CE STOPLOSS");
      toast.success(niftycestoplossprice);
      if (lasttradedpriceforce <= niftycestoplossprice) {
        // Call your separate function here
        toast.success("SL-HIT");
        handleSellBtClick();
        setNiftyCeStoplossPrice(null);
      }
    }
  }, [niftycestoplossprice, lasttradedpriceforce, cestoplossChecked]);
  const handleCeStoplossChange = (event) => {
    setCeStoplossChecked(event.target.checked);
  };
  const handleCeStoplossValueChange = (event) => {
    setCeStoplossValue(event.target.value);
  };
  const handleClickCe = () => {
    calculateNiftyCEStoplossPrice();
  };

  /* calculating trailing stoplos price */

  const calculatedNiftyTrailingCEstoploss = () => {
    if (
      optionsbuyprice !== null &&
      cestoplossChecked &&
      trailingcestoplossChecked
    ) {
      toast.success("entered trailing");
      if (
        lasttradedpriceforce - initialpricefortrail ===
        trailcestoplossValue
      ) {
        toast.success("et");
        const calculatedTrailingNiftyCEStoplossPrice = cestoplossValue;
        setTrailingNIftyCEstoplossvalue(
          calculatedTrailingNiftyCEStoplossPrice + trailcestoplossValue
        );
        setInitialPriceForTrail(initialpricefortrail + trailcestoplossValue);
      }
    }
  };

  const handleTrailingCeStoplossChange = (event) => {
    setTrailingCeStoplossChecked(event.target.checked);
  };
  const handleClickTrailCe = () => {
    calculatedNiftyTrailingCEstoploss();
  };
  const handleTrailCeStoplossValueChange = (event) => {
    setTrailCeStoplossValue(event.target.value);
  };

  useEffect(() => {
    calculatedNiftyTrailingCEstoploss(optionsbuyprice);
  }, [lasttradedpriceforce, initialpricefortrail]);
  /* realtime pnl calculation */

  const calculatePnl = (optionsbuyprice) => {
    if (optionsbuyprice !== null && optionsbuyprice !== "") {
      const calculatedPnlbeforerounding =
        (lasttradedpriceforce - optionsbuyprice) * selectedceqty - 40;
      const calculatedPnl = calculatedPnlbeforerounding.toFixed(2);
      setOptionsPnl(calculatedPnl);
    } else {
      setOptionsPnl("0");
    }
  };

  useEffect(() => {
    calculatePnl(optionsbuyprice);
  }, [lasttradedpriceforce]);

  /* placing buy order function  */

  async function handleBuyBtClick() {
    try {
      const symbolce = generateSymbol(selectedstrikeprice);
      setSymbolCeSelected(symbolce);

      const selectedQty = document.getElementById("qty").value;
      const qty = parseInt(selectedQty) * 50; // Multiply selected quantity by 50
      setSelectedCeQty(qty);
      // Update niftybuyprice with the current lastTradedPrice
      setNiftyBuyPrice(lastTradedPrice);
      setOptionsBuyPrice(lasttradedpriceforce);
      setInitialPriceForTrail(lasttradedpriceforce);
      const checkbox = document.getElementById("LIMIT");
      const type = checkbox.checked ? 1 : 2;
      const limitPrice = checkbox.checked
        ? parseFloat(document.getElementById("LIMITenter").value)
        : 0;
      const orderData = {
        symbol: symbolce,
        qty: qty,
        type: type,
        side: 1,
        productType: "INTRADAY",
        limitPrice: limitPrice,
        stopPrice: 0,
        validity: "DAY",
        disclosedQty: 0,
        offlineOrder: "False",
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/placeOrder/",
        orderData
      );

      console.log(response.data);
      toast.success("Order SuccessFull:buy ");

      calculatePnl(optionsbuyprice);
    } catch (error) {
      console.log(error);
    }
  }

  /* placing sell order function */

  async function handleSellBtClick() {
    try {
      const orderData = {
        symbol: symbolceselected,
        qty: selectedceqty,
        type: 2,
        side: -1,
        productType: "INTRADAY",
        limitPrice: 0,
        stopPrice: 0,
        validity: "DAY",
        disclosedQty: 0,
        offlineOrder: "False",
      };
      console.log("Order Data:", orderData);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/sellOrder/",
        orderData
      );
      toast.success("Order SuccessFull:SELL ");
      setOptionsBuyPrice("");
      // Uncheck the stoploss checkbox
      setStoplossChecked(false);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  /*  using arrow keys and enter key function activation */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowUp") {
        // Update niftybuyprice with the current lastTradedPrice
        setNiftyBuyPrice(lastTradedPrice);
        handleBuyBtClick();
      } else if (!stoplossChecked && event.key === "ArrowDown") {
        // 40 is the key code for the down arrow
        handleSellBtClick();
      } else if (event.key === "Enter") {
        const focusedElement = document.activeElement;
        const inputId = focusedElement.id;

        if (inputId === "stoplossValue") {
          // Call your function here
          console.log("id");
          calculateNiftyStoplossPrice();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lastTradedPrice, handleBuyBtClick]);

  return (
    <div className="containercard">
      <ToastContainer />
      <h1 className="buy">CE</h1>
      <label className="labelbuy" htmlFor="callstrike">
        EXP
      </label>
      <Options nextThursdays={getNextThursdays()} />
      <label className="labelQuantity" htmlFor="callstrike">
        QTY:
      </label>
      <Quantity />
      <label className="labelstrike" htmlFor="strikepri">
        CE STRIKE
      </label>
      <div className="strikepricece" id="strikepri">
        {strikePrices.map((strikePrice, index) => (
          <label key={strikePrice} className={`strikeprice-label-${index}`}>
            <input
              type="radio"
              className={`strikeprice-input-${index}`}
              name="strikePrice"
              value={strikePrice}
              defaultChecked={index === 1}
              // Select 2nd radio button by default
              onChange={handleStrikeChange}
            />
            {strikePrice}
          </label>
        ))}
      </div>
      <button className="buybuttonce noselect" onClick={handleBuyBtClick}>
        BUY
      </button>
      <h2 className="ltpceview">{lasttradedpriceforce}</h2>
      <div className="stoploss-checkbox">
        <input
          type="checkbox"
          id="stoploss"
          checked={stoplossChecked}
          onChange={handleStoplossChange}
        />
        <label htmlFor="stoploss" className="slnifty">
          SL-NIFTY
        </label>
      </div>
      {stoplossChecked && (
        <div className="stoploss-input">
          <label htmlFor="stoplossValue" className="SLP">
            PRICE
          </label>
          <input
            type="number"
            id="stoplossValue"
            value={stoplossValue}
            onChange={handleStoplossValueChange}
          />
          <button className="triggerstoploss" onClick={handleClick}>
            SL
          </button>
        </div>
      )}
      {/* stoplossniftyce */}
      <div className="stoplossce-checkbox">
        <input
          type="checkbox"
          id="stoplossce"
          checked={cestoplossChecked}
          onChange={handleCeStoplossChange}
        />
        <label htmlFor="stoplossce" className="slniftyce">
          NIFTYCE
        </label>
      </div>
      {cestoplossChecked && (
        <div className="stoploss-inputce">
          <label htmlFor="stoplossValuece" className="SLPce">
            PRICE
          </label>
          <input
            type="number"
            id="stoplossValuece"
            value={cestoplossValue}
            onChange={handleCeStoplossValueChange}
          />
          <button className="triggerstoplossce" onClick={handleClickCe}>
            SL
          </button>
          <div className="trailingstoplossce-checkbox">
            <input
              type="checkbox"
              id="trailingstoplossce"
              checked={trailingcestoplossChecked}
              onChange={handleTrailingCeStoplossChange}
            />
            <label htmlFor="trailingstoplossce" className="trailings">
              AUTO-TR
            </label>
          </div>
          {trailingcestoplossChecked && (
            <div className="tralingstoploss-inputce">
              <input
                type="number"
                id="trailstoplossValuece"
                value={trailcestoplossValue}
                onChange={handleTrailCeStoplossValueChange}
              />
              <button
                className="trailtriggerstoplossce"
                onClick={handleClickTrailCe}
              >
                T
              </button>
            </div>
          )}
        </div>
      )}
      {/* <h1 className="niftybuyprice">{niftybuyprice}</h1> */}
      <button className="sellbuttonce noselect" onClick={handleSellBtClick}>
        SELL
      </button>

      <h2 className="pnlofce">{optionspnl}</h2>
      <label for="LIMIT" className="labellimit">
        LIMIT
      </label>
      <input type="checkbox" id="LIMIT" name="LIMIT"></input>
      <input type="number" id="LIMITenter" name="LIMIT"></input>
      <table>
        <thead>
          <tr>
            <th>NIFTYBUY</th>
            <th>OPTIONSBUY</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{niftybuyprice}</td>
            <td>{optionsbuyprice}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
