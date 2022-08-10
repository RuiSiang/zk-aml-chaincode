import { Msps, Consortiums } from './constants';
function getSendingConsortium(mspId: string, shareMspId: string): Consortiums {
  if (
    (mspId === Msps.Org1MSP && shareMspId === Msps.Org2MSP) ||
    (mspId === Msps.Org2MSP && shareMspId === Msps.Org1MSP)
  ) {
    return Consortiums.Consortium12;
  } else if (
    (mspId === Msps.Org2MSP && shareMspId === Msps.Org3MSP) ||
    (mspId === Msps.Org3MSP && shareMspId === Msps.Org2MSP)
  ) {
    return Consortiums.Consortium23;
  } else if (
    (mspId === Msps.Org1MSP && shareMspId === Msps.Org3MSP) ||
    (mspId === Msps.Org3MSP && shareMspId === Msps.Org1MSP)
  ) {
    return Consortiums.Consortium31;
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
      Consortiums.Consortium12,
      Consortiums.Consortium31,
      Consortiums.Org1Private,
    ];
  } else if (mspId === Msps.Org2MSP) {
    return [
      Consortiums.Consortium12,
      Consortiums.Consortium23,
      Consortiums.Org2Private,
    ];
  } else if (mspId === Msps.Org3MSP) {
    return [
      Consortiums.Consortium23,
      Consortiums.Consortium31,
      Consortiums.Org3Private,
    ];
  } else {
    throw new Error('Invalid MspId');
  }
}

export { getSendingConsortium, getReceivingConsortium };
