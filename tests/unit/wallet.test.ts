import { describe, expect, it } from 'vitest';
import { Wallet } from '../../src/wallet/domain/wallet.js';

describe('Wallet', () => {
  it('fails reservation on insufficient funds', () => {
    const wallet = Wallet.open('w1', 'b1', 'EUR');
    expect(() => wallet.reserve('tx', 100, 'reserve')).toThrowError('Insufficient available balance');
  });
});
