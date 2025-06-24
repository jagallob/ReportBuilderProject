import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
const TrendChart = ({ data }) => (
  <div className="trend-chart">
    <h2>Trends</h2>
    <LineChart width={400} height={200} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  </div>
);
export default TrendChart;
