import { createStore, compose, applyMiddleware, AnyAction } from 'redux';
import thunk, { ThunkDispatch, ThunkMiddleware } from 'redux-thunk';
import { createMemoryHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';

import { createRootReducer, RootState } from './reducers';

export const history = createMemoryHistory();

declare module 'react-redux' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultRootState extends RootState {}

  function useDispatch(): ThunkDispatch<RootState, unknown, AnyAction>;
}

declare module 'typescript-fsa-redux-thunk' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultRootState extends RootState {}
}

const composeEnhancers: typeof compose =
  process.env.NODE_ENV === 'production' ? compose : Reflect.get(window, '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__') ?? compose;

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
