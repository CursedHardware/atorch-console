import _ from 'lodash-es';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Button, ButtonGroup } from 'reactstrap';
import { sendCommand } from '../../../actions/atorch';
import { CommandSet } from '../../../service/atorch-packet';

interface Props {
  type: number;
}

// eslint-disable-next-line react/display-name
export const Toolbar = React.memo<Props>(({ type }) => {
  const dispatch = useDispatch();
  const btnFn: Record<string, () => Buffer> = {
    'Setup': CommandSet.setup.bind(null, type),
    '\u2795': CommandSet.setPlus.bind(null, type),
    '\u2796': CommandSet.setMinus.bind(null, type),
    'Enter': CommandSet.enter.bind(null, type),
    'Reset All': CommandSet.resetAll.bind(null, type),
  };
  const makeCommand = (cb: () => Buffer | undefined) => () => {
    dispatch(sendCommand(cb()));
  };
  return (
    <ButtonGroup>
      {_.map(btnFn, (builder, text) => (
        <Button key={text} outline onClick={makeCommand(builder)}>
          {text}
        </Button>
      ))}
    </ButtonGroup>
  );
});
