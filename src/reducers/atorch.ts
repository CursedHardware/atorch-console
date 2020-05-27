import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { connect } from '../actions/atorch';
import { AtorchService } from '../service/atorch-service';

export type AtorchState = AtorchService | null;

export default reducerWithInitialState<AtorchState>(null).case(connect.async.done, (state, payload) => payload.result);
