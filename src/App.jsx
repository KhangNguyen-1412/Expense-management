import React from "react";

// Chart.js và wrapper cho React
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import "react-datepicker/dist/react-datepicker.css";
import { AppProvider, useAppContext } from "./context/AppContext";
import { AppLayout } from "./components/AppLayout";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
