import { combineReducers } from 'redux';
import { History } from 'history';
import { connectRouter, RouterState } from 'connected-react-router';

import atorch, { AtorchState } from './atorch';
import report, { ReportState } from './report';

export interface RootState {
  router: RouterState<History.PoorMansUnknown>;
  atorch: AtorchState;
  report: ReportState;
}

export const createRootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    atorch,
    report,
  });
