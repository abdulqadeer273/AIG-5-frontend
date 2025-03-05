import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AddCase } from "./components/AddCase";
import MainApp from "./MainApp";
import ScrollButton from "./components/ScrollButton";
import AIGFive from "./components/AIGFive";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MainApp />
    <ScrollButton />
  </React.StrictMode>
);
