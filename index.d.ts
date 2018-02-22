import * as ts from 'typescript';
export declare module RedPill {
    class Warning {
        private _text;
        constructor(warningText?: string);
        text: string;
    }
    abstract class ProgramPart {
        private _comment;
        private _endLineNum;
        private _filePath;
        private _startLineNum;
        private _tsNode;
        abstract polymerSignature: any;
        abstract polymerDecoratorSignature: any;
        abstract polymerIronPageSignature: any;
        private _warnings;
        comment: Comment;
        endLineNum: number;
        filePath: string;
        startLineNum: number;
        tsNode: ts.Node;
        warnings: Warning[];
        addWarning(warningText: any): void;
        parseChildren(returnType: ts.SyntaxKind, hasDecorators: boolean): any[];
    }
    class IncludedBehavior extends ProgramPart {
        private _name;
        private _polymerSignature;
        private _polymerDecoratorSignature;
        private _polymerIronPageSignature;
        name: string;
        readonly polymerSignature: string;
        readonly polymerDecoratorSignature: string;
        readonly polymerIronPageSignature: string;
        toDocOnlyMarkup(): string;
    }
    class Component extends ProgramPart {
        private _behaviors;
        private _className;
        private _computedProperties;
        private _cssFilePath;
        private _extendsClass;
        private _htmlFilePath;
        private _listeners;
        private _methods;
        private _name;
        private _namespace;
        private _polymerSignature;
        private _polymerDecoratorSignature;
        private _polymerIronPageSignature;
        private _properties;
        private _observers;
        private _useMetadataReflection;
        constructor(node?: ts.ClassDeclaration);
        behaviors: IncludedBehavior[];
        className: string;
        computedProperties: ComputedProperty[];
        cssFilePath: string;
        extendsClass: string;
        htmlFilePath: string;
        listeners: Listener[];
        methods: Function[];
        name: string;
        namespace: string;
        observers: Observer[];
        readonly polymerDecoratorSignature: string;
        readonly polymerIronPageSignature: string;
        readonly polymerSignature: string;
        properties: Property[];
        useMetadataReflection: boolean;
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
        private _polymerDecoratorSignature;
        private _polymerSignature;
        private _polymerIronPageSignature;
        private _returnType;
        constructor(node?: ts.Node);
        methodName: string;
        parameters: string[];
        readonly polymerSignature: string;
        readonly polymerDecoratorSignature: string;
        readonly polymerIronPageSignature: string;
        returnType: string;
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
        private _method;
        private _methodName;
        private _polymerDecoratorSignature;
        private _polymerSignature;
        private _polymerIronPageSignature;
        private _polymerAddListenerSignature;
        private _polymerRemoveListenerSignature;
        constructor(node?: ts.Node);
        elementId: string;
        eventDeclaration: string;
        eventName: string;
        isExpression: boolean;
        method: Function;
        methodName: string;
        readonly polymerAddListenerSignature: string;
        readonly polymerRemoveListenerSignature: string;
        readonly polymerDecoratorSignature: string;
        readonly polymerIronPageSignature: string;
        readonly polymerSignature: string;
    }
    class Observer extends ProgramPart {
        private _component;
        private _isComplex;
        private _method;
        private _methodName;
        private _params;
        private _polymerDecoratorSignature;
        private _polymerSignature;
        private _polymerIronPageSignature;
        private _observerPropertySignature;
        constructor(node?: ts.Node, component?: Component);
        component: Component;
        isComplex: boolean;
        method: Function;
        methodName: string;
        readonly observerPropertySignature: string;
        params: string[];
        readonly polymerDecoratorSignature: string;
        readonly polymerIronPageSignature: string;
        readonly polymerSignature: string;
    }
    class Property extends ProgramPart {
        private _containsValueArrayLiteral;
        private _containsValueFunction;
        private _containsValueObjectDeclaration;
        private _name;
        protected _params: string;
        protected _polymerDecoratorSignature: string;
        protected _polymerSignature: string;
        protected _polymerIronPageSignature: string;
        private _type;
        private _valueArrayParams;
        private _valueFunction;
        private _valueObjectParams;
        constructor(node?: ts.Node);
        readonly derivedComment: Comment;
        containsValueArrayLiteral: boolean;
        containsValueFunction: boolean;
        containsValueObjectDeclaration: boolean;
        name: string;
        params: string;
        readonly polymerDecoratorSignature: string;
        readonly polymerIronPageSignature: string;
        readonly polymerSignature: string;
        type: string;
        valueArrayParams: any;
        valueFunction: Function;
        valueObjectParams: any;
    }
    class ComputedProperty extends Property {
        private _component;
        private _derivedMethodName;
        private _method;
        private _methodName;
        protected _polymerDecoratedPropertySignature: string;
        protected _polymerDecoratorSignature: string;
        protected _polymerDecoratorTypedSignature: string;
        protected _polymerSignature: string;
        protected _polymerIronPageSignature: string;
        constructor(node?: ts.Node, component?: Component);
        component: Component;
        derivedMethodName: string;
        method: Function;
        methodName: string;
        readonly polymerDecoratedPropertySignature: string;
        readonly polymerDecoratorSignature: string;
        readonly polymerDecoratorTypedSignature: string;
        readonly polymerIronPageSignature: string;
        readonly polymerSignature: string;
        readonly propertyName: string;
        private _getNewParams();
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
    function isComputedProperty(node: ts.MethodDeclaration): boolean;
    function isListener(node: ts.MethodDeclaration): boolean;
    function isObserver(node: ts.MethodDeclaration): boolean;
    function getTypescriptType(property: Property): string;
}
declare const _default: {
    RedPill: typeof RedPill;
};
export default _default;
