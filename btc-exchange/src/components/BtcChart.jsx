// src/components/BtcChart.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const BtcChart = ({ setAvailableCurrencies, selectedCurrency, setSelectedCurrency }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAvailableCurrencies = async () => {
    try {
      const { data } = await axios.get(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/btc.json`
      );
      const currencies = Object.keys(data.btc);
      setAvailableCurrencies(currencies);
      setSelectedCurrency(currencies[0]); // Set default to first currency
    } catch (err) {
      console.error('Failed to fetch available currencies', err);
      setError('Failed to fetch available currencies.');
    }
  };

  const fetchLast30DaysData = async (currency) => {
    setLoading(true);
    setError('');
    const today = new Date();
    const promises = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];

      promises.push(
        axios.get(
          `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${formattedDate}/v1/currencies/btc.json`
        )
      );
    }

    try {
      const results = await Promise.all(promises);
      const dates = results.map((res) => res.config.url.split('/')[7]);
      const rates = results.map((res) => res.data.btc[currency] || 0);

      setChartData({
        labels: dates.reverse(),
        datasets: [
          {
            label: `BTC to ${currency.toUpperCase()} (Last 30 Days)`,
            data: rates.reverse(),
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            tension: 0.4,
            fill: true,
          },
        ],
      });
    } catch (err) {
      console.error('Failed to fetch last 30 days data', err);
      setError('Failed to fetch last 30 days data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAvailableCurrencies();
  }, []);

  useEffect(() => {
    if (selectedCurrency) {
      fetchLast180DaysData(selectedCurrency);
    }
  }, [selectedCurrency]);

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="chart-container">
      <h2>BTC Exchange Rate (Last 30 Days)</h2>
      {chartData ? (
        <Line 
          data={chartData} 
          options={{
            scales: {
              x: {
                display: false, // Hide the X-axis labels
              },
              y: {
                title: {
                  display: true,
                  text: `BTC to ${selectedCurrency.toUpperCase()}`,
                },
              },
            },
          }}
        />
      ) : (
        <p>No chart data available.</p>
      )}
    </div>
  );
};

export default BtcChart;