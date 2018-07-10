import * as ts from 'typescript';
export declare module RedPill {
    class Warning {
        private _text;
        private _tsNode;
        constructor(warningText?: string);
        text: string;
        tsNode: ts.Node;
    }
    abstract class ProgramPart {
        private _comment;
        protected _decorator: ts.Decorator;
        abstract decorator: ts.Decorator;
        private _endLineNum;
        private _fileName;
        private _filePath;
        private _startLineNum;
        private _sourceFile;
        private _tsNode;
        private _warnings;
        comment: Comment;
        endLineNum: number;
        readonly fileName: string;
        filePath: string;
        startLineNum: number;
        sourceFile: ts.SourceFile;
        tsNode: ts.Node;
        warnings: Warning[];
        addWarning(warningText: any): void;
        parseChildren(returnType: ts.SyntaxKind, hasDecorators: boolean): any[];
    }
    class IncludedBehavior extends ProgramPart {
        private _behaviorDeclarationString;
        private _elementAccessExpression;
        private _name;
        private _polymerIronPageSignature;
        private _propertyAccessExpression;
        behaviorDeclarationString: string;
        decorator: ts.Decorator;
        readonly elementAccessExpression: ts.ElementAccessExpression;
        name: string;
        readonly polymerIronPageSignature: string;
        readonly propertyAccessExpression: ts.PropertyAccessExpression;
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
        private _polymerIronPageSignature;
        private _properties;
        private _observers;
        private _useMetadataReflection;
        constructor(node?: ts.ClassDeclaration);
        behaviors: IncludedBehavior[];
        className: string;
        computedProperties: ComputedProperty[];
        cssFilePath: string;
        readonly decorator: ts.Decorator;
        extendsClass: string;
        htmlFilePath: string;
        listeners: Listener[];
        methods: Function[];
        name: string;
        namespace: string;
        observers: Observer[];
        readonly polymerIronPageSignature: string;
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
        Function = "FUNCTION"
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
        private _getIndent;
        toDocOnlyMarkup(): string;
    }
    class Function extends ProgramPart {
        private _methodName;
        private _parameters;
        private _polymerIronPageSignature;
        private _returnType;
        constructor(node?: ts.Node);
        readonly decorator: ts.Decorator;
        methodName: string;
        parameters: string[];
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
        private _eventDeclarationStr;
        private _isExpression;
        private _method;
        private _methodName;
        private _polymerIronPageSignature;
        private _polymerAddListenerSignature;
        private _polymerRemoveListenerSignature;
        constructor(node?: ts.Node);
        readonly decorator: ts.Decorator;
        elementId: string;
        eventDeclaration: ts.Expression;
        readonly eventDeclarationStr: string;
        eventName: string;
        isExpression: boolean;
        method: Function;
        methodName: string;
        readonly polymerAddListenerSignature: string;
        readonly polymerRemoveListenerSignature: string;
        readonly polymerIronPageSignature: string;
    }
    class Observer extends ProgramPart {
        private _component;
        private _isComplex;
        private _method;
        private _methodName;
        private _params;
        private _polymerIronPageSignature;
        private _observerPropertySignature;
        constructor(node?: ts.Node, component?: Component);
        component: Component;
        readonly decorator: ts.Decorator;
        isComplex: boolean;
        method: Function;
        methodName: string;
        readonly observerPropertySignature: string;
        params: string[];
        readonly polymerIronPageSignature: string;
    }
    class Property extends ProgramPart {
        private _containsValueArrayLiteral;
        private _containsValueBoolean;
        private _containsValueFunction;
        private _containsValueNull;
        private _containsValueObjectDeclaration;
        private _containsValueStringLiteral;
        private _containsValueUndefined;
        private _name;
        protected _params: string;
        protected _polymerIronPageSignature: string;
        private _type;
        private _valueArrayParams;
        private _valueFunction;
        private _valueObjectParams;
        constructor(node?: ts.Node);
        readonly decorator: ts.Decorator;
        readonly derivedComment: Comment;
        containsValueArrayLiteral: boolean;
        containsValueBoolean: boolean;
        containsValueFunction: boolean;
        containsValueNull: boolean;
        containsValueObjectDeclaration: boolean;
        containsValueStringLiteral: boolean;
        containsValueUndefined: boolean;
        name: string;
        params: string;
        readonly polymerIronPageSignature: string;
        type: string;
        valueArrayParams: any;
        valueFunction: Function;
        valueObjectParams: any;
    }
    class ComputedProperty extends Property {
        private _component;
        private _dependentPropNames;
        private _derivedMethodName;
        private _method;
        private _methodName;
        protected _polymerIronPageSignature: string;
        constructor(node?: ts.Node, component?: Component);
        component: Component;
        readonly decorator: ts.Decorator;
        readonly dependentPropNames: string[];
        derivedMethodName: string;
        method: Function;
        methodName: string;
        readonly polymerIronPageSignature: string;
        readonly propertyName: string;
        private _getNewParams;
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
    function trimLeft(str: any): string;
    function trimTabs(str: any): string;
    function trimAllWhitespace(str: any): string;
    function getObjectLiteralString(objExp: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile): any;
    function getStringFromObject(obj: any): string;
    function getObjectFromString(objectStr: string, sourceFile: ts.SourceFile): any;
    function getArrayFromString(arrayStr: string): any;
    function getPathInfo(fileName: string, docPath: string): PathInfo;
    function getStartLineNumber(node: ts.Node): number;
    function getEndLineNumber(node: ts.Node): number;
    function capitalizeFirstLetter(str: string): string;
    function isNodeComponentChild(parentNode: ts.Node, component: Component): boolean;
    function getMethodFromListener(listener: Listener): Function;
    function getMethodFromComputed(computed: ComputedProperty): Function;
    function isComponent(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): boolean;
    function isComputedProperty(node: ts.MethodDeclaration, sourceFile: ts.SourceFile): boolean;
    function isDeclaredProperty(node: ts.PropertyDeclaration): boolean;
    function isListener(node: ts.MethodDeclaration, sourceFile: ts.SourceFile): boolean;
    function isObserver(node: ts.MethodDeclaration, sourceFile: ts.SourceFile): boolean;
    function getTypescriptType(property: Property): string;
}
