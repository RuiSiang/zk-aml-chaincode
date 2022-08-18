/*
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Entry {
  id?: string;
  from: string;
  to: string;
  amount: string;
  proof: string;
}

export interface Keypair {
  pk: string;
  vk: string;
}
