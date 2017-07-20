export class WebService {
    name: string;
    version: string;
    versionPublishedBy: string;
    creationTime: string;
    snapshotId: string;
    runtimeType: string;
    initCode: string;
    code: string;
    description: string;
    operationId: string;
    inputParameterDefinitions: [Parameter];
    outputParameterDefinitions: [Parameter];
    outputFileName: [any];
    myPermissionOnService: string;
}

export class Parameter {
    name: string;
    type: string;
}

export class ExcelParameter {
    name: string;
    type: string;
    binding: any;
    range: string;
    value: any;
    labels: string[];
    display: any[][];
}
