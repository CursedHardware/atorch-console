import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../reducers";
import { ReportType } from "../service/atorch-report";

export const useAtorchService = () => useSelector((state: RootState) => state.atorch);

export const useConnected = () => {
  const [connected, setConnected] = useState(false);
  const service = useAtorchService();
  useEffect(() => service?.on("connection-state", setConnected), [service]);
  return connected;
};

export const useWatchReport = (listner: (report: ReportType) => void) => {
  const service = useAtorchService();
  useEffect(() => service?.on("report", listner), [service]);
};
