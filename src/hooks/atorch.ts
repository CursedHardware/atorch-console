import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../reducers";
import { isMeterPacket, MeterPacketType, PacketType } from "../service/atorch-packet";

export const useAtorchService = () => useSelector((state: RootState) => state.atorch);

export const useConnected = () => {
  const [connected, setConnected] = useState(false);
  const service = useAtorchService();
  useEffect(() => service?.on("connection-state", setConnected), [service]);
  return connected;
};

export const useWatchReport = (onReport: (packet: MeterPacketType) => void) => {
  const service = useAtorchService();
  const listner = (packet: PacketType) => {
    if (isMeterPacket(packet)) {
      onReport(packet);
    }
  };
  useEffect(() => service?.on("packet", listner), [service]);
};
