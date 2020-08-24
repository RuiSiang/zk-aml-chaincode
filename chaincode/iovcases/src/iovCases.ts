/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
import { Case, File } from './interfaces';
import { getConsortium } from './utils';

export class IovCases extends Contract {
    public async init(ctx: Context): Promise<string> {
        const Files = {
            c58ef59f2c3571c9da6f7a2b54103670179460e1fe9aeaf735c4e5cfaeae621a: {
                fileId:
                    'c58ef59f2c3571c9da6f7a2b54103670179460e1fe9aeaf735c4e5cfaeae621a',
                caseId:
                    '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df',
                fileBase64: 'cmFuZG9tZmlsZQ==',
            },
        };
        const Cases = {
            // keccak256 hash of string "randomfile"

            // keccak256 hash of string "randomcase"
            '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df': {
                caseName: 'random',
                description: 'case',
                fileList: {
                    c58ef59f2c3571c9da6f7a2b54103670179460e1fe9aeaf735c4e5cfaeae621a: true,
                },
            },
        };
        console.info('============= START : Initialize Ledger ===========');
        console.info('Files:', Files);
        const creater = ctx.stub.getCreator().mspid;
        // Dummy data in each org private collection for testing
        const consortium = getConsortium(creater, creater);
        for (const [key, val] of Object.entries(Cases)) {
            await ctx.stub.putPrivateData(
                `${consortium}Case`,
                key,
                Buffer.from(JSON.stringify(val))
            );
            console.info('ID: ', key, ' has been added.');
        }
        console.info('Cases:', Cases);
        for (const [key, val] of Object.entries(Files)) {
            await ctx.stub.putPrivateData(
                `${consortium}File`,
                key,
                Buffer.from(JSON.stringify(val))
            );
            console.info('ID: ', key, ' has been added.');
        }
        console.info('============= END : Initialized Ledger ===========');
        console.info('Creater: ', creater);
        return 'Ledger initialized Success';
    }
    public async createCase(
        ctx: Context,
        caseId: string,
        privateFor: string
    ): Promise<void> {
        const trans: Map<string, Uint8Array> = ctx.stub.getTransient();
        const caseName: string = trans.get('caseName').toString();
        const description: string = trans.get('description').toString();
        const consortium: string = getConsortium(
            ctx.stub.getCreator().mspid,
            privateFor
        );
        const newcase: Case = {
            caseName,
            description,
            fileList: {},
        };
        await ctx.stub.putPrivateData(
            `${consortium}Case`,
            caseId,
            Buffer.from(JSON.stringify(newcase))
        );
        console.info(newcase);
    }
    public async getCases(ctx: Context, privateFor: string): Promise<Case[]> {
        const consortium: string = getConsortium(
            ctx.stub.getCreator().mspid,
            privateFor
        );
        // get all the data in this collection
        const caseList: Case[] = [];
        for await (const { key, value } of ctx.stub.getPrivateDataByRange(
            `${consortium}Case`,
            '',
            ''
        )) {
            const strValue = Buffer.from(value).toString('utf8');
            let caseObj;
            try {
                caseObj = JSON.parse(strValue);
                delete caseObj.fileList;
                caseList.push({ caseId: key, ...caseObj });
            } catch (err) {
                console.log(err);
            }
        }
        return caseList;
    }
    public async uploadFile(
        ctx: Context,
        caseId: string,
        fileId: string,
        privateFor: string
    ): Promise<void> {
        const fileBase64: string = ctx.stub
            .getTransient()
            .get('fileBase64')
            .toString();
        const consortium: string = getConsortium(
            ctx.stub.getCreator().mspid,
            privateFor
        );
        const caseOfFile: Case = JSON.parse(
            (
                await ctx.stub.getPrivateData(
                    `${consortium}Case`,
                    caseId
                )
            ).toString()
        );
        caseOfFile.fileList[fileId] = true;
        await ctx.stub.putPrivateData(
            `${consortium}Case`,
            caseId,
            Buffer.from(JSON.stringify(caseOfFile))
        );
        const uploadFile: File = {
            caseId,
            fileBase64,
        };
        await ctx.stub.putPrivateData(
            `${consortium}File`,
            fileId,
            Buffer.from(JSON.stringify(uploadFile))
        );
    }
    public async getFileList(
        ctx: Context,
        caseId: string,
        privateFor: string
    ): Promise<string[]> {
        const consortium: string = getConsortium(
            ctx.stub.getCreator().mspid,
            privateFor
        );
        const caseOfFile: Case = JSON.parse(
            (
                await ctx.stub.getPrivateData(
                    `${consortium}Case`,
                    caseId
                )
            ).toString()
        );
        const fileIds: string[] = [];
        for (const [fileId, exist] of Object.entries(caseOfFile.fileList)) {
            if (exist) {
                fileIds.push(fileId);
            }
        }
        return fileIds;
    }
    public async deleteFile(
        ctx: Context,
        fileId: string,
        privateFor: string
    ): Promise<void> {
        const consortium: string = getConsortium(
            ctx.stub.getCreator().mspid,
            privateFor
        );
        const fileToDelete: File = JSON.parse(
            (
                await ctx.stub.getPrivateData(
                    `${consortium}File`,
                    fileId
                )
            ).toString()
        );
        const caseToDeleteFile: Case = JSON.parse(
            (
                await ctx.stub.getPrivateData(
                    `${consortium}Case`,
                    fileToDelete.caseId
                )
            ).toString()
        );
        caseToDeleteFile.fileList[fileId] = false;
        fileToDelete.fileBase64 = ''; // change to empty string
        await ctx.stub.putPrivateData(
            `${consortium}Case`,
            fileToDelete.caseId,
            Buffer.from(JSON.stringify(caseToDeleteFile))
        );
        await ctx.stub.putPrivateData(
            `${consortium}File`,
            fileId,
            Buffer.from(JSON.stringify(fileToDelete))
        );
    }
    public async getFile(
        ctx: Context,
        fileId: string,
        privateFor: string
    ): Promise<object> {
        const consortium: string = getConsortium(
            ctx.stub.getCreator().mspid,
            privateFor
        );
        const fileToGet: File = JSON.parse(
            (
                await ctx.stub.getPrivateData(
                    `${consortium}File`,
                    fileId
                )
            ).toString()
        );
        return fileToGet;
    }
}
// public async printLedger(ctx: Context): Promise<void> {
//     console.info('============= START : getData ===========');
//     const data: Case = JSON.parse(
//         (
//             await ctx.stub.getState(
//                 '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df'
//             )
//         ).toString()
//     );
//     console.info(data);
//     console.info('============= END : getData ===========');
// }
// public async setLedger(ctx: Context): Promise<void> {
//     console.info('============= START : setData ===========');

//     const data: Case = JSON.parse(
//         (
//             await ctx.stub.getState(
//                 '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df'
//             )
//         ).toString()
//     );
//     console.info('old data: ', data);
//     data.description = 'changed description';
//     console.info('new data: ', data);
//     ctx.stub.putState(
//         '994ae0ec690e328c7a59693afc8f6f4124ca157fb4719bba7907a1f74547a2df',
//         Buffer.from(JSON.stringify(data))
//     );
//     console.info('============= END : setData ===========');
// }
// public async setPrivateData(ctx: Context): Promise<void> {
//     console.info('Set data in collectionConsortium1');
//     await ctx.stub.putPrivateData(
//         'collectionConsortium1',
//         'Data',
//         Buffer.from('private data c1')
//     );
//     console.info('Set data in collectionConsortium2');
//     await ctx.stub.putPrivateData(
//         'collectionConsortium2',
//         'Data',
//         Buffer.from('private data c2')
//     );
//     console.info('Set implicit private data');
//     await ctx.stub.putPrivateData(
//         '_implicit_org_DEFAULT',
//         'myConsortium',
//         Buffer.from('Consortium1')
//     );
// }
// public async printPrivateData(ctx: Context): Promise<void> {
//     console.info('Get data in collectionConsortium1');
//     console.info(
//         (
//             await ctx.stub.getPrivateData('collectionConsortium1', 'Data')
//         ).toString()
//     );
//     console.info('Get data in collectionConsortium2');
//     console.info(
//         (
//             await ctx.stub.getPrivateData('collectionConsortium2', 'Data')
//         ).toString()
//     );
//     console.info('Get implicit private data');
//     console.info(
//         (
//             await ctx.stub.getPrivateData(
//                 '_implicit_org_DEFAULT',
//                 'myConsortium'
//             )
//         ).toString()
//     );
// }
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
