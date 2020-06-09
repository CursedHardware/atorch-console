import React from "react";
import { Row } from "reactstrap";

import { USBFn } from "./USBFn";
import { PrintUSBReport } from "./PrintUSBReport";
import { PrintACReport } from "./PrintACReport";

import {
  MeterPacketType,
  USBMeterPacket,
  ACMeterPacket,
} from "../../../service/atorch-packet";

interface Props {
  packet?: MeterPacketType;
}

export const PrintReport: React.FC<Props> = ({ packet }) => {
  if (packet instanceof USBMeterPacket) {
    return (
      <>
        <Row className="ml-2 justify-content-center">
          <PrintUSBReport packet={packet} />
        </Row>
        <USBFn makeCommand={USBMeterPacket.makeCommand} />
      </>
    );
  } else if (packet instanceof ACMeterPacket) {
    return (
      <>
        <Row className="ml-2 justify-content-center">
          <PrintACReport packet={packet} />
        </Row>
        <USBFn makeCommand={ACMeterPacket.makeCommand} />
      </>
    );
  }
  return <p>Not connected to device.</p>;
};
