import { reducerWithInitialState } from "typescript-fsa-reducers";
import { requestDevice } from "../actions/atorch";
import { AtorchService } from "../service/atorch-service";

export type AtorchState = AtorchService | null;

export default reducerWithInitialState<AtorchState>(null).case(requestDevice.async.done, (state, payload) => payload.result);
