/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Entry, Keypair } from './interfaces';
import { getSendingConsortium, getReceivingConsortium } from './utils';

export class aml extends Contract {
  public async init(ctx: Context, pk: string, vk: string): Promise<string> {
    const Entries = {
      c58ef59f2c3571c9da6f7a2b54103670179460e1fe9aeaf735c4e5cfaeae621a: {
        id: '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df',
        from: 'Bank Example A',
        to: 'Bank Example B',
        amount: '100',
        proof:
          'fc8f6f4124ca1994ae0ec9693a690e328c7a557fb4719bba7907a1f74547a2df',
      },
    };
    console.info('============= START : Initialize Ledger ===========');
    console.info('Entries:', Entries);
    const creator = ctx.stub.getCreator().mspid;
    // Dummy data in each org private collection for testing
    const consortium = getSendingConsortium(creator, creator);
    await ctx.stub.putState('pk', Buffer.from(pk));
    console.info('Proving key: ', pk, ' has been initialized.');
    await ctx.stub.putState('vk', Buffer.from(vk));
    console.info('Verification key: ', vk, ' has been initialized.');
    for (const [key, val] of Object.entries(Entries)) {
      await ctx.stub.putPrivateData(
        `${consortium}Entry`,
        key,
        Buffer.from(JSON.stringify(val))
      );
      console.info('ID: ', key, ' has been added.');
    }
    console.info('============= END : Initialized Ledger ===========');
    console.info('Creator: ', creator);
    return 'Ledger initialized Success';
  }
  public async getKeys(ctx: Context): Promise<Keypair> {
    return {
      pk: Buffer.from(await ctx.stub.getState('pk')).toString('utf-8'),
      vk: Buffer.from(await ctx.stub.getState('vk')).toString('utf-8'),
    };
  }
  public async newEntry(
    ctx: Context,
    id: string,
    privateFor: string
  ): Promise<void> {
    const trans: Map<string, Uint8Array> = ctx.stub.getTransient();
    const from: string = trans.get('from').toString();
    const to: string = trans.get('to').toString();
    const amount: string = trans.get('amount').toString();
    const proof: string = trans.get('proof').toString();
    console.info('Consortium for', ctx.clientIdentity.getMSPID(), privateFor);
    const consortium: string = getSendingConsortium(
      ctx.clientIdentity.getMSPID(),
      privateFor
    );
    console.info(consortium);
    const newEntry: Entry = {
      from,
      to,
      amount,
      proof,
    };
    await ctx.stub.putPrivateData(
      `${consortium}Entry`,
      id,
      Buffer.from(JSON.stringify(newEntry))
    );
    console.info(newEntry);
  }
  public async getEntries(ctx: Context): Promise<Entry[]> {
    console.info('Consortiums for', ctx.clientIdentity.getMSPID());
    const consortiums: string[] = getReceivingConsortium(
      ctx.clientIdentity.getMSPID()
    );
    console.info(consortiums);
    // get all the data in this collection
    const entryList: Entry[] = [];
    await Promise.all(
      consortiums.map(async (consortium) => {
        for await (const { key, value } of ctx.stub.getPrivateDataByRange(
          `${consortium}Entry`,
          '',
          ''
        )) {
          const strValue = Buffer.from(value).toString('utf8');
          let entry: Entry;
          try {
            entry = JSON.parse(strValue);
            entryList.push({ id: key, ...entry });
          } catch (err) {
            console.log(err);
          }
        }
      })
    );

    return entryList;
  }
  // public async deleteEntry(
  //   ctx: Context,
  //   id: string,
  //   privateFor: string
  // ): Promise<void> {
  //   const consortium: string = getConsortium(
  //     ctx.stub.getCreator().mspid,
  //     privateFor
  //   );
  //   await ctx.stub.putPrivateData(
  //     `${consortium}Entry`,
  //     id,
  //     Buffer.from(JSON.stringify({}))
  //   );
  // }
  public async getEntry(ctx: Context, id: string): Promise<object> {
    const entries = await this.getEntries(ctx);
    let ret = { id };
    console.info(entries);
    entries.forEach((entry) => {
      if (entry.id == id) {
        ret = { id, ...entry };
      }
    });
    return ret;
  }
}
