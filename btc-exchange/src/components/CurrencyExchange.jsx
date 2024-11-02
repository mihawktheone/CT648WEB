// src/components/CurrencyExchange.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CurrencyExchange = ({ availableCurrencies, selectedCurrency, setSelectedCurrency }) => {
  const [btcRates, setBtcRates] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD format

  const fetchBtcRates = async (date) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/btc.json`
      );
      setBtcRates(data.btc || {});
    } catch (err) {
      console.error('Failed to fetch BTC rates', err);
      setError('Failed to fetch BTC rates.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBtcRates(formatDate(selectedDate));
  }, [selectedDate]);

  return (
    <div className="exchange-container">
      <h1>BTC Exchange Rates</h1>

      <div className="date-picker">
        <label>Select Date: </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
        />
      </div>

      <div className="currency-select">
        <label>Select Currency: </label>
        <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
          {availableCurrencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="rates">
          <h3>
            1 BTC = {btcRates[selectedCurrency]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedCurrency.toUpperCase()} (on{' '}
            {formatDate(selectedDate)})
          </h3>
        </div>
      )}
    </div>
  );
};

export default CurrencyExchange;