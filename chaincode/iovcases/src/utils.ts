import { Msps, Consortiums } from './constants';
function getConsortium(mspId: string, shareMspId: string): Consortiums {
    // TODO for three org
    switch (mspId) {
        case Msps.DEFAULT:
            return Consortiums.Consortium1;
        default:
            throw new Error('Invalid MspId');
    }
}

export { getConsortium };
