import classNames from 'classnames';
import _ from 'lodash-es';
import React from 'react';
import { Table } from 'reactstrap';
import locals from './index.scss';

interface Props {
  record: React.ReactNode[][];
}

export const Report: React.FC<Props> = ({ record }) => (
  <Table hover borderless size='sm' className={locals.table}>
    <thead>
      <tr>
        <th className={classNames('text-right', locals.name)}>#</th>
        <th className={locals.value}>Value</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {_.map(record, ([name, value, button], index) => (
        <tr key={index}>
          <td className={classNames('text-monospace', 'text-right')}>{name}</td>
          <td>{value}</td>
          <td>{button}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);
