import { createStore, compose, applyMiddleware, AnyAction } from "redux";
import thunk, { ThunkDispatch, ThunkMiddleware } from "redux-thunk";
import { createMemoryHistory } from "history";
import { routerMiddleware } from "connected-react-router";

import { createRootReducer, RootState } from "./reducers";

export const history = createMemoryHistory();

declare module "react-redux" {
  function useDispatch(): ThunkDispatch<RootState, never, AnyAction>;
}

const composeEnhancers: typeof compose =
  process.env.NODE_ENV === "production"
    ? compose
    : (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?? compose;

export const configureStore = () =>
  createStore(
    createRootReducer(history),
    undefined,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history), // connected-react-router
        thunk as ThunkMiddleware<RootState>, // redux-thunk
      ),
    ),
  );
