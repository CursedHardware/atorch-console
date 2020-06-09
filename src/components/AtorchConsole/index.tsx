import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Row, Container } from "reactstrap";

import locals from "./index.scss";

import { useWatchReport, useConnected } from "../../hooks/atorch";
import { requestDevice, connect, disconnect } from "../../actions/atorch";
import { MeterPacketType } from "../../service/atorch-packet";
import { PrintReport } from "./PrintReport";

export const AtorchConsole: React.FC = () => {
  const dispatch = useDispatch();
  const connected = useConnected();
  const [packet, setPacket] = useState<MeterPacketType>();
  useWatchReport(setPacket);
  const handleConnectDevice = async () => {
    if (connected) {
      await dispatch(disconnect());
    } else {
      await dispatch(requestDevice());
      await dispatch(connect());
    }
  };
  return (
    <Container className={locals.container}>
      <Row className="ml-2 justify-content-center">
        <Button outline onClick={handleConnectDevice}>
          {connected ? "Disconnect" : "Connect"}
        </Button>
      </Row>
      <PrintReport packet={packet} />
    </Container>
  );
};
