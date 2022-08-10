import { Msps, Consortiums } from './constants';
function getSendingConsortium(mspId: string, shareMspId: string): Consortiums {
  if (
    (mspId === Msps.Org1MSP && shareMspId === Msps.Org2MSP) ||
    (mspId === Msps.Org2MSP && shareMspId === Msps.Org1MSP)
  ) {
    return Consortiums.Consortium1;
  } else if (
    (mspId === Msps.Org2MSP && shareMspId === Msps.Org3MSP) ||
    (mspId === Msps.Org3MSP && shareMspId === Msps.Org2MSP)
  ) {
    return Consortiums.Consortium2;
  } else if (
    (mspId === Msps.Org1MSP && shareMspId === Msps.Org3MSP) ||
    (mspId === Msps.Org3MSP && shareMspId === Msps.Org1MSP)
  ) {
    return Consortiums.Consortium3;
  } else if (mspId === Msps.Org1MSP && shareMspId === Msps.Org1MSP) {
    return Consortiums.Org1Private;
  } else if (mspId === Msps.Org2MSP && shareMspId === Msps.Org2MSP) {
    return Consortiums.Org2Private;
  } else if (mspId === Msps.Org3MSP && shareMspId === Msps.Org3MSP) {
    return Consortiums.Org3Private;
  } else {
    throw new Error('Invalid MspId');
  }
}

function getReceivingConsortium(mspId: string): Consortiums[] {
  if (mspId === Msps.Org1MSP) {
    return [
      Consortiums.Consortium1,
      Consortiums.Consortium3,
      Consortiums.Org1Private,
    ];
  } else if (mspId === Msps.Org2MSP) {
    return [
      Consortiums.Consortium1,
      Consortiums.Consortium2,
      Consortiums.Org2Private,
    ];
  } else if (mspId === Msps.Org3MSP) {
    return [
      Consortiums.Consortium2,
      Consortiums.Consortium3,
      Consortiums.Org3Private,
    ];
  } else {
    throw new Error('Invalid MspId');
  }
}

export { getSendingConsortium, getReceivingConsortium };
