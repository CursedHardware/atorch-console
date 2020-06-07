import { createStore, compose, applyMiddleware, PreloadedState, AnyAction } from "redux";
import thunk, { ThunkDispatch, ThunkMiddleware } from "redux-thunk";
import { createMemoryHistory } from "history";
import { routerMiddleware } from "connected-react-router";

import { createRootReducer, RootState } from "./reducers";

export const history = createMemoryHistory();

declare module "react-redux" {
  function useDispatch(): ThunkDispatch<RootState, never, AnyAction>;
}

// @ts-ignore
const composeEnhancers: typeof compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?? compose;

export const configureStore = <S>(preloadedState?: PreloadedState<S>) =>
  createStore(
    createRootReducer(history),
    preloadedState,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history), // connected-react-router
        thunk as ThunkMiddleware<RootState>, // redux-thunk
      ),
    ),
  );
