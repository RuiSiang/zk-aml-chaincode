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
interface FileList {
    [index: string]: boolean;
}

export interface Case {
    caseId?: string;
    caseName: string;
    description: string;
    fileList?: FileList;
}

export interface File {
    fileId?: string;
    caseId: string;
    fileBase64: string;
}
