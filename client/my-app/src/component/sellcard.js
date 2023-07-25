import React, { useEffect, useState } from "react";
import axios from "axios";
import "./sellcard.css";
import Quantity from "./QuantityPE";
import Options from "./OptionsPe";
import { ToastContainer, toast } from "react-toastify";
import { formatDate } from "./helpers";
import "react-toastify/dist/ReactToastify.css";

export default function Sellcard({ lastTradedPrice }) {
  /* constants*/
  const [strikePrices, setStrikePrices] = useState([]);

  const [lasttradedpriceforce, setLastTradedPriceForCe] = useState(null);

  const [stoplossValue, setStoplossValue] = useState("");
  const [stoplossChecked, setStoplossChecked] = useState(false);
  const [niftystoplossprice, setNiftyStoplossPrice] = useState(null);

  const [niftycestoplossprice, setNiftyCeStoplossPrice] = useState(null);
  const [cestoplossChecked, setCeStoplossChecked] = useState(false);
  const [cestoplossValue, setCeStoplossValue] = useState("");
  const [optionsbuyprice, setOptionsBuyPrice] = useState("");

  const [initialpricefortrail, setInitialPriceForTrail] = useState("");
  const [trailcestoplossValue, setTrailCeStoplossValue] = useState("");
  const [TrailingNIftyCEstoplossvalue, setTrailingNIftyCEstoplossvalue] =
    useState("");
  const [trailingcestoplossChecked, setTrailingCeStoplossChecked] =
    useState(false);

  const [optionspnl, setOptionsPnl] = useState("0");

  const [niftybuyprice, setNiftyBuyPrice] = useState(null);

  const [selectedstrikeprice, setSelectedStrikePrice] = useState(null);

  const [selectedceqty, setSelectedCeQty] = useState("");

  const [symbolpeselected, setSymbolPeSelected] = useState("");

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
        "http://127.0.0.1:8000/api/last_traded_price_pe/",
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

  const isLastThursdayOfMonth = (date) => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    const lastThursday = new Date(nextMonth);
    lastThursday.setDate(lastThursday.getDate() - 1);
    while (lastThursday.getDay() !== 4) {
      lastThursday.setDate(lastThursday.getDate() - 1);
    }
    return (
      date.getMonth() === lastThursday.getMonth() &&
      date.getDate() === lastThursday.getDate()
    );
  };

  const generateSymbol = (selectedstrikeprice) => {
    const selectedExpiryDate = new Date(
      document.getElementById("callstrike").value
    );
    const selectedstrikepricece = selectedstrikeprice;

    const year = selectedExpiryDate.getFullYear().toString().substr(-2);
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
    const month = isLastThursdayOfMonth(selectedExpiryDate)
      ? selectedExpiryDate
          .toLocaleString("default", { month: "short" })
          .toUpperCase()
      : monthMap[
          selectedExpiryDate.toLocaleString("default", { month: "short" })
        ];
    const day = selectedExpiryDate.getDate().toString().padStart(2, "0");

    const isLastThursday = isLastThursdayOfMonth(selectedExpiryDate);

    // Generate the symbol based on whether it's the last Thursday or not
    let symbol;
    if (isLastThursday) {
      const underlyingSymbol = "NSE:NIFTY"; // Replace with actual underlying symbol
      const strike = selectedstrikepricece;
      const optionType = "CE";
      symbol = `${underlyingSymbol}${year}${month}${strike}PE`;
    } else {
      const underlyingSymbol = "NSE:NIFTY"; // Replace with actual underlying symbol
      symbol = `${underlyingSymbol}${year}${monthMap[month]}${day}${selectedstrikepricece}PE`;
    }

    return symbol;
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
      toast.success("NIFTY SL ENTERED");
      if (lastTradedPrice <= niftystoplossprice) {
        // Call your separate function here
        toast.success("NIFTY SL HIT");
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
      if (lasttradedpriceforce <= niftycestoplossprice) {
        // Call your separate function here
        toast.success("hit stoploss");
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
      stoplossChecked &&
      trailingcestoplossChecked
    ) {
      if (
        lasttradedpriceforce - initialpricefortrail ===
        trailcestoplossValue
      ) {
        const calculatedTrailingNiftyCEStoplossPrice =
          optionsbuyprice - stoplossValue;
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
    setTrailCeStoplossValue(event.target.checked);
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

  /* placing buy order */

  async function handleBuyBtClick() {
    try {
      const symbolpe = generateSymbol(selectedstrikeprice);
      setSymbolPeSelected(symbolpe);
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
        symbol: symbolpe,
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
      console.log("Order Data:", orderData);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/placeOrder/",
        orderData
      );
      console.log(response.data);
      toast.success("Order SuccessFull: ");

      calculatePnl(optionsbuyprice);
    } catch (error) {
      console.log(error);
    }
  }

  /* placing sell order */
  async function handleSellBtClick() {
    try {
      // Check if the NIFTY PE stop loss is checked and niftystoplossprice is available
      const stopPrice =
        cestoplossChecked && niftycestoplossprice !== null
          ? parseFloat(niftycestoplossprice)
          : 0;
      const limitPrice =
        cestoplossChecked && niftycestoplossprice !== null
          ? parseFloat(niftycestoplossprice)
          : 0;
      const tickSize = 0.05; // Tick size for the security

      // Round the stopPrice and limitPrice to the nearest multiple of tickSize
      const roundedStopPrice = Math.round(stopPrice / tickSize) * tickSize;
      const roundedLimitPrice = Math.round(limitPrice / tickSize) * tickSize;
      const type = cestoplossChecked ? 4 : 2; // Set type to 4 when stoplossChecked is true, otherwise set it to 2
      const orderData = {
        symbol: symbolpeselected,
        qty: selectedceqty,
        type: type,
        side: -1,
        productType: "INTRADAY",
        limitPrice: roundedLimitPrice,
        stopPrice: roundedStopPrice,
        validity: "DAY",
        disclosedQty: 0,
        offlineOrder: "False",
      };
      console.log("Order Data:", orderData);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/sellOrder/",
        orderData
      );
      setOptionsBuyPrice("");

      // Uncheck the stoploss checkbox
      setStoplossChecked(false);

      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  /* side buttons for keys for buy and sell orders */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 37) {
        // 38 is the key code for the up arrow
        handleBuyBtClick();
      } else if (event.keyCode === 39) {
        // 40 is the key code for the down arrow
        handleSellBtClick();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="containercardsell">
      <ToastContainer />
      <h1 className="sell">PE</h1>
      <label className="labelsell" htmlFor="cutstrike">
        EXP
      </label>
      <Options nextThursdays={getNextThursdays()} />
      <label className="labelQuantity" htmlFor="callstrike">
        QTY:
      </label>
      <Quantity />
      <label className="labelstrikepe" htmlFor="strikepripe">
        PE STRIKE
      </label>
      <div className="strikepricepe" id="strikepri">
        {strikePrices.map((strikePrice, index) => (
          <label key={strikePrice} className={`strikepricepe-label-${index}`}>
            <input
              type="radio"
              className={`strikepricepe-input-${index}`}
              name="strikePrice"
              value={strikePrice}
              onChange={handleStrikeChange}
            />
            {strikePrice}
          </label>
        ))}
      </div>
      <button className="buybuttonpe noselect" onClick={handleBuyBtClick}>
        BUY
      </button>
      <h2 className="ltppeview">{lasttradedpriceforce}</h2>

      {/* stoplossniftyce */}
      <div className="stoplosspe-checkbox">
        <input
          type="checkbox"
          id="stoplosspe"
          checked={cestoplossChecked}
          onChange={handleCeStoplossChange}
        />
        <label htmlFor="stoplosspe" className="slniftype">
          NIFTYPE
        </label>
      </div>
      {cestoplossChecked && (
        <div className="stoploss-inputpe">
          <label htmlFor="stoplossValuepe" className="SLPpe">
            PRICE
          </label>
          <input
            type="number"
            id="stoplossValuepe"
            value={cestoplossValue}
            onChange={handleCeStoplossValueChange}
          />
          <button className="triggerstoplosspe" onClick={handleClickCe}>
            SL
          </button>
          <div className="trailingstoplosspe-checkbox">
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
      <button className="sellbuttonpe noselect" onClick={handleSellBtClick}>
        SELL
      </button>
      <h2 className="pnlofpe">{optionspnl}</h2>
      <label for="LIMITPE" className="labellimitPE">
        LIMIT
      </label>
      <input type="checkbox" id="LIMITPE" name="LIMITPE"></input>
      <input type="number" id="LIMITenterPE" name="LIMITPE"></input>
      <h1 className="niftypebuyprice">NIFTYBUY:{niftybuyprice}</h1>
      <h1 className="optionpebuyprice">OPTIONSBUY:{optionsbuyprice}</h1>
    </div>
  );
}
