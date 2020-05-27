import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';

import { configureStore, history } from './configureStore';
import { AtorchConsole } from './components/AtorchConsole';

const store = configureStore();

const Entry: React.FC = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path='/' component={AtorchConsole} />
      </Switch>
    </ConnectedRouter>
  </Provider>
);

export default Entry;
