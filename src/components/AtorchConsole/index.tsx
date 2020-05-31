import _ from "lodash";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { ButtonGroup, Button, Row, Container, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

import locals from "./index.scss";

import { useWatchReport, useConnected } from "../../hooks/atorch";
import { CommandType } from "../../service/atorch-service";
import { requestDevice, connect, disconnect, sendCommand } from "../../actions/atorch";
import { ReportType } from "../../service/atorch-report";
import { PrintReport } from "./PrintReport";

const btnResets: Record<string, CommandType> = {
  "A·h": CommandType.ResetAh,
  "W·h": CommandType.ResetWh,
  Duration: CommandType.ResetDuration,
  All: CommandType.ResetAll,
};

const btnFn: Record<string, CommandType> = {
  Setup: CommandType.Setup,
  "+": CommandType.Plus,
  "-": CommandType.Minus,
  Enter: CommandType.Enter,
};

export const AtorchConsole: React.FC = () => {
  const dispatch = useDispatch();
  const connected = useConnected();
  const [resetDropdown, setResetDropdownOpen] = useState(false);
  const [report, setReport] = useState<ReportType>();

  useWatchReport(setReport);
  const onSendCommand = (type: CommandType) => dispatch(sendCommand(type));
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
        <PrintReport report={report} />
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
