import { ProgramPart } from './program-part';
export declare class Listener extends ProgramPart {
    private _elementId;
    private _eventName;
    private _eventDeclaration;
    private _isExpression;
    private _methodName;
    elementId: string;
    eventDeclaration: string;
    eventName: string;
    isExpression: boolean;
    methodName: any;
    toMarkup(): string;
}
