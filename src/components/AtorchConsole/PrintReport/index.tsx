/* eslint-disable react/jsx-key */
import _ from 'lodash-es';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Button, Row } from 'reactstrap';
import { sendCommand } from '../../../actions/atorch';
import { ACMeterPacket, CommandSet, DCMeterPacket, MeterPacketType, USBMeterPacket } from '../../../service/atorch-packet';
import locals from './index.scss';
import { Report } from './Report';
import { Toolbar } from './Toolbar';
import { FormattedUnit } from './utils';

interface Props {
  packet?: MeterPacketType;
}

const CO2Name = (
  <span>
    CO<sub>2</sub>
  </span>
);

export const PrintReport: React.FC<Props> = ({ packet }) => {
  const type = packet?.type ?? 0;
  let record: React.ReactNode[][];
  if (packet instanceof ACMeterPacket) {
    record = [
      ['Voltage', <FormattedUnit value={packet.mVoltage} unit='V' />],
      ['Ampere', <FormattedUnit value={packet.mAmpere} unit='A' />],
      ['Watt', <FormattedUnit value={packet.mWatt} unit='W' />],
      ['W·h', <FormattedUnit value={packet.mWh} unit='W·h' />, <Command onClick={CommandSet.resetWh.bind(null, type)}>Reset</Command>],
      [CO2Name, <FormattedUnit value={getCO2(packet.mWh)} unit='g' />],
      ['Price', `${packet.price.toFixed(2)} $/kW·h`, <SetupPriceCommand type={type} value={packet.price} />],
      ['Fee', `${packet.fee.toFixed(5)} $`],
      ['Frequency', `${packet.frequency.toFixed(1)} Hz`],
      ['PF', packet.pf.toFixed(2)],
      ['Temperature', <FormattedTemperature value={packet.temperature} />],
      ['Duration', packet.duration],
      ['Backlight Time', <FormattedBacklightTime time={packet.backlightTime} />, <SetupBacklightTimeCommand type={type} value={packet.backlightTime} />],
    ];
  } else if (packet instanceof DCMeterPacket) {
    record = [
      ['Voltage', <FormattedUnit value={packet.mVoltage} unit='V' />],
      ['Ampere', <FormattedUnit value={packet.mAmpere} unit='A' />],
      ['Watt', <FormattedUnit value={packet.mWatt} unit='W' />],
      ['W·h', <FormattedUnit value={packet.mWh} unit='W·h' />, <Command onClick={CommandSet.resetWh.bind(null, type)}>Reset</Command>],
      [CO2Name, <FormattedUnit value={getCO2(packet.mWh)} unit='g' />],
      ['Price', `${packet.price.toFixed(2)} $/kW·h`, <SetupPriceCommand type={type} value={packet.price} />],
      ['Fee', `${packet.fee.toFixed(5)} $`],
      ['Temperature', <FormattedTemperature value={packet.temperature} />],
      ['Duration', packet.duration],
      ['Backlight Time', <FormattedBacklightTime time={packet.backlightTime} />, <SetupBacklightTimeCommand type={type} value={packet.backlightTime} />],
    ];
  } else if (packet instanceof USBMeterPacket) {
    record = [
      ['Voltage', <FormattedUnit value={packet.mVoltage} unit='V' />],
      ['Ampere', <FormattedUnit value={packet.mAmpere} unit='A' />],
      ['Watt', <FormattedUnit value={packet.mWatt} unit='W' />],
      ['A·h', <FormattedUnit value={packet.mAh} unit='A·h' />, <Command onClick={CommandSet.resetAh.bind(null, type)}>Reset</Command>],
      ['W·h', <FormattedUnit value={packet.mWh} unit='W·h' />, <Command onClick={CommandSet.resetWh.bind(null, type)}>Reset</Command>],
      [CO2Name, <FormattedUnit value={getCO2(packet.mWh)} unit='g' />],
      ['USB D-', <FormattedUnit value={packet.dataN} unit='V' />],
      ['USB D+', <FormattedUnit value={packet.dataP} unit='V' />],
      ['Temperature', <FormattedTemperature value={packet.temperature} />],
      ['Duration', packet.duration, <Command onClick={CommandSet.resetDuration.bind(null, type)}>Reset</Command>],
      ['Backlight Time', <FormattedBacklightTime time={packet.backlightTime} />],
    ];
  } else {
    return <p>Not connected to device.</p>;
  }
  return (
    <>
      <Row className='ml-2 justify-content-center'>
        <Report record={record} />
      </Row>
      <Row className='ml-2 justify-content-center'>
        <Toolbar type={type} />
      </Row>
    </>
  );
};

const Command: React.FC<{
  onClick: () => Buffer | undefined;
}> = (props) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(sendCommand(props.onClick()));
  };
  return (
    <Button color='link' size='sm' className={locals.btn} onClick={handleClick}>
      {props.children}
    </Button>
  );
};

const SetupPriceCommand: React.FC<{ type: number; value: number }> = ({ type, value }) => {
  const onClick = () => {
    const price = prompt('Setup Price (0 to 999.99)', value, 0, 1000);
    if (price === undefined) {
      alert(`input unexpected (0 to 999.99)`);
      return;
    }
    console.log(price);
    return CommandSet.setPrice(type, _.toFinite(price * 100));
  };
  return <Command onClick={onClick}>Setup</Command>;
};

const SetupBacklightTimeCommand: React.FC<{ type: number; value: number }> = ({ type, value }) => {
  const onClick = () => {
    const time = prompt('Setup Backlight Time (0 to 60)', value, 0, 60.01);
    if (time === undefined) {
      alert(`input unexpected (0 to 60)`);
      return;
    }
    return CommandSet.setBacklightTime(type, _.toFinite(time));
  };
  return <Command onClick={onClick}>Setup</Command>;
};

const FormattedTemperature: React.FC<{ value: number }> = ({ value }) => (
  <span>
    <span>{value} &#8451;</span>, <span>{(value * 9) / 5 + 32} &#8457;</span>
  </span>
);

const FormattedBacklightTime: React.FC<{ time: number }> = ({ time }) => {
  if (time === 0) {
    return <span>Normally Closed</span>;
  } else if (time === 60) {
    return <span>Normally Open</span>;
  } else {
    return <span>{time} sec</span>;
  }
};

function getCO2(wh: number) {
  return wh * 0.997;
}

function prompt(message: string, defaultValue: number, minValue: number, maxValue: number) {
  const returns = globalThis.prompt(message, String(defaultValue));
  const price = Number.parseFloat(returns ?? '-1');
  if (!_.inRange(price, minValue, maxValue)) {
    return;
  }
  return price;
}
