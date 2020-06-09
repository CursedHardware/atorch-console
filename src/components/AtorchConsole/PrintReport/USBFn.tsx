import _ from "lodash";
import React from "react";
import { useDispatch } from "react-redux";
import {
  Row,
  ButtonGroup,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from "reactstrap";
import { sendCommand } from "../../../actions/atorch";

const btnResets: Record<string, number> = {
  "A·h": 0x02,
  "W·h": 0x01,
  Duration: 0x03,
  Undefined: 0x04,
  All: 0x05,
};

const btnFn: Record<string, number> = {
  Setup: 0x31,
  "\u2795": 0x33,
  "\u2796": 0x34,
  Enter: 0x32,
};

interface USBFnProps {
  makeCommand(code: number): Buffer;
}

export const USBFn: React.FC<USBFnProps> = ({ makeCommand }) => {
  const dispatch = useDispatch();
  const [resetDropdown, setResetDropdownOpen] = React.useState(false);

  const onSendCommand = (code: number) =>
    dispatch(sendCommand(makeCommand(code)));
  const onResetToggle = () => setResetDropdownOpen(!resetDropdown);
  return (
    <Row className="ml-2 justify-content-center">
      <ButtonGroup>
        {_.map(btnFn, (code, text) => (
          <Button key={code} outline onClick={() => onSendCommand(code)}>
            {text}
          </Button>
        ))}
      </ButtonGroup>
      <ButtonDropdown
        className="ml-4"
        isOpen={resetDropdown}
        toggle={onResetToggle}
      >
        <DropdownToggle outline caret>
          Reset
        </DropdownToggle>
        <DropdownMenu>
          {_.map(btnResets, (code, text) => (
            <DropdownItem key={code} onClick={() => onSendCommand(code)}>
              Reset {text}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </ButtonDropdown>
    </Row>
  );
};
