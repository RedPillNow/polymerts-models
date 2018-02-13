import { ProgramPart } from './program-part';
import { Comment } from './comment';
export declare class Property extends ProgramPart {
    private _containsValueArrayLiteral;
    private _containsValueFunction;
    private _containsValueObjectDeclaration;
    private _name;
    private _params;
    private _type;
    private _valueArrayParams;
    private _valueObjectParams;
    readonly derivedComment: Comment;
    containsValueArrayLiteral: boolean;
    containsValueFunction: boolean;
    containsValueObjectDeclaration: boolean;
    name: string;
    params: string;
    type: string;
    valueArrayParams: any;
    valueObjectParams: any;
    private _parseParams();
    private _isPartOfValue(part);
    private _parseValueArray();
    private _parseValueObject();
    private _parseValueFunction(valueFunctionPart);
    toMarkup(): string;
}
