import { ProgramPart } from './program-part';
export declare class Function extends ProgramPart {
    private _methodName;
    private _parameters;
    private _returnType;
    private _signature;
    methodName: string;
    parameters: string[];
    returnType: string;
    signature: string;
    toMarkup(): string;
}
