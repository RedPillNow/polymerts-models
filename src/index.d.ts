import * as ts from 'typescript';
export declare module RedPill {
    abstract class ProgramPart {
        private _comment;
        private _endLineNum;
        private _startLineNum;
        private _tsNode;
        abstract toDocOnlyMarkup(): string;
        comment: Comment;
        endLineNum: number;
        startLineNum: number;
        tsNode: ts.Node;
    }
    class Behavior extends ProgramPart {
        private _name;
        name: string;
        toDocOnlyMarkup(): string;
    }
    class Component extends ProgramPart {
        private _behaviors;
        private _className;
        private _extendsClass;
        private _filePath;
        private _htmlFilePath;
        private _listeners;
        private _methods;
        private _name;
        private _namespace;
        private _observers;
        private _properties;
        behaviors: Behavior[];
        className: string;
        extendsClass: string;
        filePath: string;
        htmlFilePath: string;
        listeners: Listener[];
        methods: any[];
        name: string;
        namespace: string;
        observers: Observer[];
        properties: Property[];
        toDocOnlyMarkup(): string;
        protected _writeDocHtmlComment(): string;
        protected _writeDocHead(): string;
        protected _writeDocFoot(): string;
        protected _writeDocProperties(): string;
        protected _writeDocBehaviors(): string;
        protected _writeDocListeners(): string;
        protected _writeDocMethods(): string;
        protected _writeDocObservers(): string;
    }
    enum ProgramType {
        Property = "PROPERTY",
        Computed = "COMPUTED",
        Component = "COMPONENT",
        Behavior = "BEHAVIOR",
        Listener = "LISTENER",
        Observer = "OBSERVER",
        Function = "FUNCTION",
    }
    class Comment {
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
        toDocOnlyMarkup(): string;
    }
    class Function extends ProgramPart {
        private _methodName;
        private _parameters;
        private _returnType;
        private _signature;
        methodName: string;
        parameters: string[];
        returnType: string;
        signature: string;
        toDocOnlyMarkup(): string;
    }
    class HtmlComment {
        private _comment;
        comment: string;
        toDocOnlyMarkup(): string;
    }
    class Listener extends ProgramPart {
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
        toDocOnlyMarkup(): string;
    }
    class Observer extends ProgramPart {
        private _properties;
        private _methodName;
        properties: string[];
        methodName: any;
        toDocOnlyMarkup(): string;
    }
    class Property extends ProgramPart {
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
        toDocOnlyMarkup(): string;
    }
    class ComputedProperty extends Property {
        private _methodName;
        methodName: any;
        private _getNewParams();
        toDocOnlyMarkup(): string;
    }
    class PathInfo {
        fileName: string;
        dirName: string;
        docFileName: string;
        fullDocFilePath: string;
        htmlFileName: string;
        fullHtmlFilePath: string;
    }
    function trimRight(str: any): string;
    function trimTabs(str: any): string;
    function trimAllWhitespace(str: any): string;
    function getObjectLiteralString(objExp: ts.ObjectLiteralExpression): any;
    function getStringFromObject(obj: any): string;
    function getObjectFromString(objectStr: string): any;
    function getArrayFromString(arrayStr: string): any;
    function getPathInfo(fileName: string, docPath: string): PathInfo;
    function getStartLineNumber(node: ts.Node): number;
    function getEndLineNumber(node: ts.Node): number;
    function capitalizeFirstLetter(str: string): string;
    function isNodeComponentChild(parentNode: ts.Node, component: Component): boolean;
    function getMethodFromListener(listener: Listener): Function;
    function getMethodFromComputed(computed: ComputedProperty): Function;
    function getMethodFromObserver(observer: Observer): Function;
    function isComputedProperty(node: ts.MethodDeclaration): boolean;
    function isListener(node: ts.MethodDeclaration): boolean;
    function isObserver(node: ts.MethodDeclaration): boolean;
}
declare const _default: {
    RedPill: typeof RedPill;
};
export default _default;
