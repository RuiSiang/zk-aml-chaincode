/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Case, File, Ledger } from './interfaces';

enum consortiums {
    Consortium1,
    Consortium2,
    Consortium3,
}
export class IovCases extends Contract {
    public async init(ctx: Context, Consortium: consortiums): Promise<string> {
        const datas: Ledger = {
            // keccak256 hash of string "randomfile"
            c58ef59f2c3571c9da6f7a2b54103670179460e1fe9aeaf735c4e5cfaeae621a: {
                fileId:
                    'c58ef59f2c3571c9da6f7a2b54103670179460e1fe9aeaf735c4e5cfaeae621a',
                caseId:
                    '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df',
                fileBase64: 'cmFuZG9tZmlsZQ==',
            },
            // keccak256 hash of string "randomcase"
            '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df': {
                caseId:
                    '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df',
                caseName: 'random',
                description: 'case',
                fileList: [
                    'c58ef59f2c3571c9da6f7a2b54103670179460e1fe9aeaf735c4e5cfaeae621a',
                ],
            },
        };
        console.info('============= START : Initialize Ledger ===========');
        console.info(datas);
        for (const [key, val] of Object.entries(datas)) {
            await ctx.stub.putState(key, Buffer.from(JSON.stringify(val)));
            console.info('ID: ', key, ' has been added.');
        }
        console.info('============= END : Initialized Ledger ===========');
        const creater = ctx.stub.getCreator().mspid;
        console.info('Creater: ', creater);
        return 'Ledger initialized Success';
    }
    public async printLedger(ctx: Context): Promise<void> {
        console.info('============= START : getData ===========');
        const data: Case = JSON.parse(
            (
                await ctx.stub.getState(
                    '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df'
                )
            ).toString()
        );
        console.info(data);
        console.info('============= END : getData ===========');
    }
    public async setLedger(ctx: Context): Promise<void> {
        console.info('============= START : setData ===========');

        const data: Case = JSON.parse(
            (
                await ctx.stub.getState(
                    '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df'
                )
            ).toString()
        );
        console.info('old data: ', data);
        data.description = 'changed description';
        console.info('new data: ', data);
        ctx.stub.putState(
            '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df',
            Buffer.from(JSON.stringify(data))
        );
        console.info('============= END : setData ===========');
    }
    public async setPrivateData(ctx: Context): Promise<void> {
        console.info('Set data in collectionConsortium1');
        await ctx.stub.putPrivateData(
            'collectionConsortium1',
            'Data',
            Buffer.from('private data c1')
        );
        console.info('Set data in collectionConsortium2');
        await ctx.stub.putPrivateData(
            'collectionConsortium2',
            'Data',
            Buffer.from('private data c2')
        );
        console.info('Set implicit private data');
        await ctx.stub.putPrivateData(
            '_implicit_org_DEFAULT',
            'myConsortium',
            Buffer.from('Consortium1')
        );
    }
    public async printPrivateData(ctx: Context): Promise<void> {
        console.info('Get data in collectionConsortium1');
        console.info(
            (
                await ctx.stub.getPrivateData('collectionConsortium1', 'Data')
            ).toString()
        );
        console.info('Get data in collectionConsortium2');
        console.info(
            (
                await ctx.stub.getPrivateData('collectionConsortium2', 'Data')
            ).toString()
        );
        console.info('Get implicit private data');
        console.info(
            (
                await ctx.stub.getPrivateData(
                    '_implicit_org_DEFAULT',
                    'myConsortium'
                )
            ).toString()
        );
    }
}
// export class FabCar extends Contract {
//     public async initLedger(ctx: Context) {
//         console.info("============= START : Initialize Ledger ===========");
//         const cars: Car[] = [
//             {
//                 color: "blue",
//                 make: "Toyota",
//                 model: "Prius",
//                 owner: "Tomoko",
//             },
//             {
//                 color: "red",
//                 make: "Ford",
//                 model: "Mustang",
//                 owner: "Brad",
//             },
//             {
//                 color: "green",
//                 make: "Hyundai",
//                 model: "Tucson",
//                 owner: "Jin Soo",
//             },
//             {
//                 color: "yellow",
//                 make: "Volkswagen",
//                 model: "Passat",
//                 owner: "Max",
//             },
//             {
//                 color: "black",
//                 make: "Tesla",
//                 model: "S",
//                 owner: "Adriana",
//             },
//             {
//                 color: "purple",
//                 make: "Peugeot",
//                 model: "205",
//                 owner: "Michel",
//             },
//             {
//                 color: "white",
//                 make: "Chery",
//                 model: "S22L",
//                 owner: "Aarav",
//             },
//             {
//                 color: "violet",
//                 make: "Fiat",
//                 model: "Punto",
//                 owner: "Pari",
//             },
//             {
//                 color: "indigo",
//                 make: "Tata",
//                 model: "Nano",
//                 owner: "Valeria",
//             },
//             {
//                 color: "brown",
//                 make: "Holden",
//                 model: "Barina",
//                 owner: "Shotaro",
//             },
//         ];

//         for (let i = 0; i < cars.length; i++) {
//             cars[i].docType = "car";
//             await ctx.stub.putState(
//                 "CAR" + i,
//                 Buffer.from(JSON.stringify(cars[i]))
//             );
//             console.info("Added <--> ", cars[i]);
//         }
//         console.info("============= END : Initialize Ledger ===========");
//     }

//     public async queryCar(ctx: Context, carNumber: string): Promise<string> {
//         const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
//         if (!carAsBytes || carAsBytes.length === 0) {
//             throw new Error(`${carNumber} does not exist`);
//         }
//         console.log(carAsBytes.toString());
//         return carAsBytes.toString();
//     }

//     public async createCar(
//         ctx: Context,
//         carNumber: string,
//         make: string,
//         model: string,
//         color: string,
//         owner: string
//     ) {
//         console.info("============= START : Create Car ===========");

//         const car: Car = {
//             color,
//             docType: "car",
//             make,
//             model,
//             owner,
//         };

//         await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
//         console.info("============= END : Create Car ===========");
//     }

//     public async queryAllCars(ctx: Context): Promise<string> {
//         const startKey = "";
//         const endKey = "";
//         const allResults = [];
//         for await (const { key, value } of ctx.stub.getStateByRange(
//             startKey,
//             endKey
//         )) {
//             const strValue = Buffer.from(value).toString("utf8");
//             let record;
//             try {
//                 record = JSON.parse(strValue);
//             } catch (err) {
//                 console.log(err);
//                 record = strValue;
//             }
//             allResults.push({ Key: key, Record: record });
//         }
//         console.info(allResults);
//         return JSON.stringify(allResults);
//     }

//     public async changeCarOwner(
//         ctx: Context,
//         carNumber: string,
//         newOwner: string
//     ) {
//         console.info("============= START : changeCarOwner ===========");

//         const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
//         if (!carAsBytes || carAsBytes.length === 0) {
//             throw new Error(`${carNumber} does not exist`);
//         }
//         const car: Car = JSON.parse(carAsBytes.toString());
//         car.owner = newOwner;

//         await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
//         console.info("============= END : changeCarOwner ===========");
//     }
// }
