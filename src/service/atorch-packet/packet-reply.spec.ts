import { assert } from 'chai';
import 'mocha';
import { ReplyPacket } from './packet-reply';
import { ReplyType } from './types';

describe('Reply', () => {
  const entries: [string, ReplyType | undefined, string][] = [
    ['FF55020101000040', ReplyType.OK, 'OK'],
    ['FF55020103000042', ReplyType.Unsupported, 'Unsupported'],
    ['FF55020000000046', undefined, 'Undefined'],
  ];
  for (const [packet, expected, title] of entries) {
    it(`Reply: ${title}`, () => {
      const block = Buffer.from(packet, 'hex');
      const command = new ReplyPacket(block);
      assert.equal(command.toType(), expected);
    });
  }
});
