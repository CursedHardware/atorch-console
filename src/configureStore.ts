import { createStore, compose, applyMiddleware, PreloadedState } from "redux";
import thunk from "redux-thunk";
import { createHashHistory } from "history";
import { routerMiddleware } from "connected-react-router";

import { createRootReducer } from "./reducers";

export const history = createHashHistory();

// @ts-ignore
const composeEnhancers: typeof compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const configureStore = <S>(preloadedState?: PreloadedState<S>) =>
  createStore(
    createRootReducer(history),
    preloadedState,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history), // connected-react-router
        thunk, // redux-thunk
      ),
    ),
  );
