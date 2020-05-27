import "bootstrap/dist/css/bootstrap.min.css";

import ready from "domready";
import React from "react";
import ReactDOM from "react-dom";

import Entry from "./entry";

ready(() => {
  const container = document.createElement("main");
  ReactDOM.render(<Entry />, container, () => {
    document.body = document.createElement("body");
    document.body.appendChild(container);
  });
});
