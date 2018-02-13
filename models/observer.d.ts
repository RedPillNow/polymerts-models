import { ProgramPart } from './program-part';
export declare class Observer extends ProgramPart {
    private _properties;
    private _methodName;
    properties: string[];
    methodName: any;
    toMarkup(): string;
}
