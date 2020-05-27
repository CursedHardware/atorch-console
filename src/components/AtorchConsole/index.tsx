import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Container, Row } from 'reactstrap';
import { connect } from '../../actions/atorch';
import locals from './index.scss';
import { PrintReport } from './PrintReport';

export const AtorchConsole: React.FC = () => {
  const dispatch = useDispatch();
  const connected = useSelector((state) => state.report.connected);
  const latest = useSelector((state) => state.report.latest);
  const onConnect = () => dispatch(connect());
  return (
    <Container className={locals.container}>
      <Row className='ml-2 justify-content-center'>
        <Button outline onClick={onConnect}>
          {connected ? 'Disconnect' : 'Connect'}
        </Button>
      </Row>
      <PrintReport packet={latest} />
    </Container>
  );
};
