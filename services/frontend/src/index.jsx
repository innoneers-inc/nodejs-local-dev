import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
