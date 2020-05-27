import { produce } from 'immer';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { setConnected, updatePacket } from '../actions/atorch';
import { MeterPacketType, ReplyPacket } from '../service/atorch-packet';

export interface ReportState {
  connected: boolean;
  latest?: MeterPacketType;
}

const defaultState: ReportState = {
  connected: false,
};

export default reducerWithInitialState(defaultState)
  .case(setConnected, (state, connected) =>
    produce(state, (draft) => {
      draft.connected = connected;
    }),
  )
  .case(updatePacket, (state, packet) =>
    produce(state, (draft) => {
      if (packet === undefined) {
        return;
      } else if (packet instanceof ReplyPacket) {
        return;
      } else {
        draft.latest = packet;
      }
    }),
  );
