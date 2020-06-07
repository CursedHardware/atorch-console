import _ from "lodash";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { ButtonGroup, Button, Row, Container, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

import locals from "./index.scss";

import { useWatchReport, useConnected } from "../../hooks/atorch";
import { requestDevice, connect, disconnect, sendCommand } from "../../actions/atorch";
import { MeterPacketType } from "../../service/atorch-packet";
import { PrintReport } from "./PrintReport";

const btnResets: Record<string, number> = {
  "A·h": 0x02,
  "W·h": 0x01,
  Duration: 0x03,
  All: 0x05,
};

const btnFn: Record<string, number> = {
  Setup: 0x31,
  "\u2795": 0x33,
  "\u2796": 0x34,
  Enter: 0x32,
};

export const AtorchConsole: React.FC = () => {
  const dispatch = useDispatch();
  const connected = useConnected();
  const [resetDropdown, setResetDropdownOpen] = useState(false);
  const [packet, setPacket] = useState<MeterPacketType>();
  useWatchReport(setPacket);

  const onSendCommand = (type: number) => dispatch(sendCommand(type));
  const onResetToggle = () => setResetDropdownOpen(!resetDropdown);
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
        <ButtonDropdown className="ml-4" isOpen={resetDropdown} toggle={onResetToggle}>
          <DropdownToggle outline caret>
            Reset
          </DropdownToggle>
          <DropdownMenu>
            {_.map(btnResets, (type, text) => (
              <DropdownItem key={type} disabled={!connected} onClick={() => onSendCommand(type)}>
                Reset {text}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </ButtonDropdown>
      </Row>
      <Row className="ml-2 justify-content-center">
        <PrintReport packet={packet} />
      </Row>
      <Row className="ml-2 justify-content-center">
        <ButtonGroup>
          {_.map(btnFn, (type, text) => (
            <Button key={type} outline disabled={!connected} onClick={() => onSendCommand(type)}>
              {text}
            </Button>
          ))}
        </ButtonGroup>
      </Row>
    </Container>
  );
};
