import "bootstrap/dist/css/bootstrap.min.css";

import ready from "domready";
import React from "react";
import ReactDOM from "react-dom";
import * as Tracker from "./tracker";

import Entry from "./entry";

ready(() => {
  Tracker.initialize();
  const container = document.createElement("main");
  ReactDOM.render(<Entry />, container, () => {
    document.body = document.createElement("body");
    document.body.appendChild(container);
  });
});
