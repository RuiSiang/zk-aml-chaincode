import { Msps, Consortiums } from './constants';
function getConsortium(mspid: Msps): Consortiums {
    // TODO for three org
    if (mspid === Msps.DEFAULT) {
        return Consortiums.Consortium1;
    }
}

export { getConsortium };
