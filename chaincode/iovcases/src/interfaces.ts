/*
 * SPDX-License-Identifier: Apache-2.0
 */

// export interface Car {
//     docType?: string;
//     color: string;
//     make: string;
//     model: string;
//     owner: string;
// }

export interface Case {
    caseId: string;
    caseName: string;
    description: string;
    fileList: string[];
}

export interface File {
    fileId: string;
    caseId: string;
    fileBase64: string;
}

export interface Ledger {
    [index: string]: Case | File;
}
