import * as ts from 'typescript';
export declare abstract class ProgramPart {
    private _comment;
    private _endLineNum;
    private _startLineNum;
    private _tsNode;
    abstract toMarkup(): string;
    comment: Comment;
    endLineNum: number;
    startLineNum: number;
    tsNode: ts.Node;
}
export declare class Behavior extends ProgramPart {
    private _name;
    name: string;
    toMarkup(): string;
}
export declare class Component extends ProgramPart {
    private _behaviors;
    private _className;
    private _htmlFilePath;
    private _listeners;
    private _methods;
    private _name;
    private _observers;
    private _properties;
    behaviors: Behavior[];
    className: string;
    htmlFilePath: string;
    listeners: Listener[];
    methods: any[];
    name: string;
    observers: Observer[];
    properties: Property[];
    toMarkup(): string;
    private _writeHtmlComment();
    private _writeHead();
    private _writeFoot();
    private _writeProperties();
    private _writeBehaviors();
    private _writeListeners();
    private _writeMethods();
    private _writeObservers();
}
export declare enum ProgramType {
    Property = "PROPERTY",
    Computed = "COMPUTED",
    Component = "COMPONENT",
    Behavior = "BEHAVIOR",
    Listener = "LISTENER",
    Observer = "OBSERVER",
    Function = "FUNCTION",
}
export declare class Comment {
    private _commentObj;
    private _commentText;
    private _endLineNum;
    private _isFor;
    private _startLineNum;
    private _tags;
    readonly commentObj: any;
    commentText: string;
    endLineNum: number;
    isFor: ProgramType;
    startLineNum: number;
    tags: string[];
    private _getIndent();
    toMarkup(): string;
}
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
export declare class HtmlComment {
    private _comment;
    comment: string;
    toMarkup(): string;
}
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
export declare class Observer extends ProgramPart {
    private _properties;
    private _methodName;
    properties: string[];
    methodName: any;
    toMarkup(): string;
}
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
export declare class ComputedProperty extends Property {
    private _methodName;
    methodName: any;
    private _getNewParams();
    toMarkup(): string;
}
