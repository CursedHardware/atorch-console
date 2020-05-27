import _ from "lodash";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { ButtonGroup, Button, Row, Container, Table, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import classNames from "classnames";

import locals from "./AtorchConsole.scss";

import { useWatchReport, useConnected } from "../hooks/atorch";
import { CommandType } from "../service/atorch-service";
import { requestDevice, connect, disconnect, sendCommand } from "../actions/atorch";
import { ReportType } from "../service/atorch-report";

const btnResets: Record<string, CommandType> = {
  "A·h": CommandType.ResetAh,
  "W·h": CommandType.ResetWh,
  Duration: CommandType.ResetDuration,
  All: CommandType.ResetAll,
};

const btnFn: Record<string, CommandType> = {
  Setup: CommandType.Setup,
  Enter: CommandType.Enter,
  "+": CommandType.Plus,
  "-": CommandType.Minus,
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

  const data: Record<string, string | undefined> = {
    Voltage: report?.voltage.toFixed(2),
    Amp: report?.amp.toFixed(2),
    Watt: report?.watt.toFixed(4),
    "mA·h": report?.mah.toString(),
    "W·h": report?.wh.toFixed(2),
    "D+": report?.dataP.toFixed(2),
    "D-": report?.dataN.toFixed(2),
    Duration: report?.duration,
  };

  return (
    <Container>
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
        <Table hover borderless size="sm" className={locals.table}>
          <thead>
            <tr>
              <th className={classNames("text-right", locals.name)}>#</th>
              <th className={locals.value}>Value</th>
            </tr>
          </thead>
          <tbody>
            {_.map(data, (value, key) => (
              <tr key={key}>
                <th className="text-monospace text-right">{key}</th>
                <td className="text-monospace">{value}</td>
              </tr>
            ))}
          </tbody>
        </Table>
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
