import * as fs from 'fs';
import * as path from 'path';
import * as htmlParser from 'htmlparser2';
import * as ts from 'typescript';

export module RedPill {
	/**
	 * Top level abstract class representing a component or part of a component. It contains
	 * basic properties, getters, setters and abstract class definition
	 * @export
	 * @abstract
	 * @class ProgramPart
	 */
	export abstract class ProgramPart {
		private _comment: Comment;
		private _endLineNum: number;
		private _filePath: string;
		private _startLineNum: number;
		private _tsNode: ts.Node;
		/**
		 * This is mainly for generating iron-component-page documentation for a
		 * PolymerTS element which depends on Polymer 1.x
		 * @abstract
		 * @returns {string}
		 */
		abstract toDocOnlyMarkup(): string;
		/**
		 * A comment object derived during the parsing
		 * @type {Comment}
		 */
		public get comment(): Comment {
			if (this._comment === undefined && this.tsNode) {
				let tsNodeAny = (<any>this.tsNode);
				if (tsNodeAny.jsDoc && tsNodeAny.jsDoc.length > 0) {
					let comm: Comment = new Comment();
					comm.commentText = tsNodeAny.jsDoc[0].comment;
					if (tsNodeAny.jsDoc[0].tags && tsNodeAny.jsDoc[0].tags.length > 0) {
						let tags = [];
						for (let i = 0; i < tsNodeAny.jsDoc[0].tags.length; i++) {
							let tag = tsNodeAny.jsDoc[0].tags[i]; // Tag ts.Node
							let tagName = '@' + tag.tagName.text; // The text = of the tag '@param'
							let tagNameType = tag.typeExpression ? tag.typeExpression.getText() : tag.comment;
							let tagTextName = tag.name ? tag.name.getText() : '';
							let tagComment = tag.comment ? tag.comment : '';
							tagName += ' ' + tagNameType; // The type = @param '{string}'
							tagName += ' ' + tagTextName; // The name = @param {string} 'foo'
							if (tag.comment !== tagNameType) {
								tagName += ' ' + tagComment; // The comment = @param {string} foo 'some comment'
							}
							tags.push(tagName);
						}
						comm.tags = tags;
					}
					this._comment = comm;
				}
			}
			return this._comment;
		}

		public set comment(comment) {
			this._comment = comment;
		}
		/**
		 * The ending line number for a particular typescript node
		 * @type {number}
		 */
		get endLineNum(): number {
			if (!this._endLineNum && this.tsNode) {
				this._endLineNum = getEndLineNumber(this.tsNode);
			}
			return this._endLineNum;
		}

		set endLineNum(endLineNum) {
			this._endLineNum = endLineNum;
		}
		/**
		 * The file path where this TypeScript node was encountered
		 * @type {string}
		 */
		get filePath(): string {
			if (!this._filePath && this.tsNode) {
				this._filePath = this.tsNode.getSourceFile().fileName;
			}
			return this._filePath;
		}

		set filePath(filePath) {
			this._filePath = filePath;
		}
		/**
		 * The starting line number
		 * @type {number}
		 */
		get startLineNum(): number {
			if ((!this._startLineNum || this._startLineNum === 0) && this.tsNode) {
				this._startLineNum = getStartLineNumber(this.tsNode);
			}
			return this._startLineNum;
		}

		set startLineNum(startLineNum) {
			this._startLineNum = startLineNum;
		}
		/**
		 * The node for this element
		 * @type {TypeScript.Node}
		 */
		get tsNode(): ts.Node {
			return this._tsNode;
		}

		set tsNode(tsNode) {
			this._tsNode = tsNode;
		}
		/**
		 * Parse the children of tsNode. Look for the returnType and return an array
		 * of nodes that match returnType. If hasDecorators is true, then only include
		 * nodes with a SyntaxKind of returnType if they have decorators
		 * @param {ts.SyntaxKind} returnType
		 * @param {boolean} hasDecorators
		 * @returns {any[]}
		 */
		parseChildren(returnType: ts.SyntaxKind, hasDecorators: boolean): any[] {
			let kidsOfType = [];
			let parseKids = (node: ts.Node) => {
				switch (node.kind) {
					case returnType:
						if (hasDecorators && node.decorators && node.decorators.length > 0) {
							kidsOfType.push(node);
						} else if (!hasDecorators) {
							kidsOfType.push(node);
						}
						break;
				};
				ts.forEachChild(node, parseKids);
			};
			parseKids(this.tsNode);
			return kidsOfType;
		}
	}
	/**
	 * This is a class representing a Behavior defined as a decorator to a component
	 * with @behavior
	 * @export
	 * @class IncludedBehavior
	 * @extends {ProgramPart}
	 */
	export class IncludedBehavior extends ProgramPart {
		private _name: string;

		get name(): string {
			return this._name;
		}

		set name(name) {
			this._name = name;
		}

		toDocOnlyMarkup() {
			let comment = this.comment ? '\n' + this.comment.toDocOnlyMarkup() : '';
			let behaviorStr = comment;
			behaviorStr += this.name;
			return behaviorStr;
		}
	}
	/**
	 * Model for a custom component or element defined with @component
	 * @export
	 * @class Component
	 * @extends {ProgramPart}
	 */
	export class Component extends ProgramPart {
		private _behaviors: IncludedBehavior[];
		private _className: string;
		private _computedProperties: ComputedProperty[];
		private _cssFilePath: string;
		private _extendsClass: string;
		private _htmlFilePath: string;
		private _listeners: Listener[];
		private _methods: any[];
		private _name: string;
		private _namespace: string;
		private _properties: Property[];
		private _observers: Observer[];

		constructor(node?: ts.ClassDeclaration) {
			super();
			this.tsNode = node;
		}
		/**
		 * The behaviors this class depends upon
		 * @type {IncludedBehavior[]}
		 */
		get behaviors(): IncludedBehavior[] {
			if ((!this._behaviors || this._behaviors.length === 0) && this.tsNode) {
				let behaviors = [];
				this.tsNode.decorators.forEach((decorator: ts.Decorator) => {
					let exp: ts.Expression = decorator.expression;
					let expText = exp.getText();
					let behaviorMatch = /\s*(?:behavior)\s*\((...*)\)/.exec(exp.getText());
					if (behaviorMatch && behaviorMatch.length > 0) {
						let behave: IncludedBehavior = new IncludedBehavior();
						behave.tsNode = decorator;
						behave.name = behaviorMatch[1];
						behaviors.push(behave);
					}
				});
				this._behaviors = behaviors;
			}
			return this._behaviors || [];
		}

		set behaviors(behaviors) {
			this._behaviors = behaviors;
		}
		/**
		 * The name of this class
		 * @type {string}
		 */
		get className(): string {
			if (!this._className && this.tsNode) {
				let clazz: ts.ClassDeclaration = <ts.ClassDeclaration>this.tsNode;
				this._className = clazz.name.getText();
			}
			return this._className;
		}

		set className(className) {
			this._className = className;
		}
		/**
		 * The computed properties this class defines
		 * @type {ComputedProperty[]}
		 */
		get computedProperties(): ComputedProperty[] {
			if (!this._computedProperties && this.tsNode) {
				let computedDeclarations = this.parseChildren(ts.SyntaxKind.MethodDeclaration, true);
				let computedProps = [];
				for (let i = 0; i < computedDeclarations.length; i++) {
					let computedPropNode = computedDeclarations[i];
					if (isComputedProperty(computedPropNode)) {
						let computedProperty = new ComputedProperty(computedPropNode);
						computedProps.push(computedProperty);
					}
				}
				this._computedProperties = computedProps;
			}
			return this._computedProperties || [];
		}

		set computedProperties(computedProperties) {
			this._computedProperties = computedProperties;
		}
		/**
		 * The path to an external CSS file. This property is populated
		 * even if there isn't an external CSS file
		 * @type {string}
		 */
		get cssFilePath(): string {
			if (!this._cssFilePath && this.filePath) {
				let baseFilePath = path.basename(this.filePath, '.ts');
				let dirName = path.dirname(this.filePath);
				this._cssFilePath = path.join(dirName, baseFilePath + '.css');
			}
			return this._cssFilePath;
		}

		set cssFilePath(cssFilePath) {
			this._cssFilePath = cssFilePath;
		}
		/**
		 * The class the component class extends
		 * @type {string}
		 */
		get extendsClass(): string {
			return this._extendsClass;
		}

		set extendsClass(extendsClass) {
			this._extendsClass = extendsClass;
		}
		/**
		 * The path to the accompanying HTML file.
		 * @type {string}
		 */
		get htmlFilePath(): string {
			if (!this._htmlFilePath && this.filePath) {
				let baseFileName = path.basename(this.filePath, '.ts');
				let dirName = path.dirname(this.filePath);
				this._htmlFilePath = path.join(dirName, baseFileName + '.html');
			}
			return this._htmlFilePath;
		}

		set htmlFilePath(htmlFilePath) {
			this._htmlFilePath = htmlFilePath;
		}
		/**
		 * The listeners this component has defined
		 * @type {Listener[]}
		 */
		get listeners(): Listener[] {
			if (!this._listeners && this.tsNode) {
				let listenerDeclarations = this.parseChildren(ts.SyntaxKind.MethodDeclaration, true);
				let listeners = [];
				for (let i = 0; i < listenerDeclarations.length; i++) {
					let listenerNode = listenerDeclarations[i];
					if (isListener(listenerNode)) {
						let listener = new Listener(listenerNode);
						listeners.push(listener);
					}
				}
				this._listeners = listeners;
			}
			return this._listeners || [];
		}

		set listeners(listeners) {
			this._listeners = listeners;
		}
		/**
		 * The methods for this class. It does not include methods for
		 * @computed, @listener or @observer declarations
		 * @type {Function[]}
		 */
		get methods(): Function[] {
			if (!this._methods && this.tsNode) {
				let methodDeclarations = this.parseChildren(ts.SyntaxKind.MethodDeclaration, false);
				let methods = [];
				for (let i = 0; i < methodDeclarations.length; i++) {
					let methodNode = methodDeclarations[i];
					if (!isObserver(methodNode) && !isListener(methodNode) && !isComputedProperty(methodNode)) {
						let func = new Function(methodNode);
						methods.push(func);
					}
				}
				this._methods = methods;
			}
			return this._methods || [];
		}

		set methods(methods) {
			this._methods = methods;
		}
		/**
		 * The tag name this component defines
		 * @type {string}
		 */
		get name(): string {
			if (!this._name && this.tsNode) {
				this.tsNode.decorators.forEach((decorator: ts.Decorator) => {
					let exp: ts.Expression = decorator.expression;
					let expText = exp.getText();
					let componentMatch = /\s*(?:component)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(exp.getText());
					if (componentMatch && componentMatch.length > 0) {
						this._name = componentMatch[1];
					}
				});
			}
			return this._name;
		}

		set name(name) {
			this._name = name;
		}
		/**
		 * The namespace this component class is defined in
		 * @type {string}
		 */
		get namespace(): string {
			return this._namespace;
		}

		set namespace(namespace) {
			this._namespace = namespace;
		}
		/**
		 * The observers which are defined using @observe
		 * @type {Observer[]}
		 */
		get observers(): Observer[] {
			if (!this._observers && this.tsNode) {
				let obsDeclarations = this.parseChildren(ts.SyntaxKind.MethodDeclaration, true);
				let obs = [];
				for (let i = 0; i < obsDeclarations.length; i++) {
					let obsNode = obsDeclarations[i];
					if (isObserver(obsNode)) {
						let observer = new Observer(obsNode);
						obs.push(observer);
					}
				}
				this._observers = obs;
			}
			return this._observers || [];
		}

		set observers(observers) {
			this._observers = observers;
		}
		/**
		 * The declared properties of this component class. If a property is
		 * not defined using `@property` then it will not be in this array
		 * @todo need to determine what to do if we encounter a property that is not a declared `@property`
		 * @type {Property[]}
		 */
		get properties(): Property[] {
			if (!this._properties && this.tsNode) {
				let propDeclarations = this.parseChildren(ts.SyntaxKind.PropertyDeclaration, true);
				let props = [];
				for (let i = 0; i < propDeclarations.length; i++) {
					let propNode = propDeclarations[i];
					let prop = new Property(propNode);
					props.push(prop);
				}
				this._properties = props;
			}
			return this._properties || [];
		}

		set properties(properties) {
			this._properties = properties;
		}

		toDocOnlyMarkup() {
			let componentStr = this._writeDocHtmlComment();
			componentStr += this._writeDocHead();
			if (this.behaviors && this.behaviors.length > 0) {
				componentStr += this._writeDocBehaviors();
			}
			if (this.properties && this.properties.length > 0) {
				componentStr += this._writeDocProperties();
			}
			if (this.observers && this.observers.length > 0) {
				componentStr += this._writeDocObservers();
			}
			if (this.listeners && this.listeners.length > 0) {
				componentStr += this._writeDocListeners();
			}
			if (this.observers && this.observers.length > 0) {

			}
			if (this.methods && this.methods.length > 0) {
				componentStr += this._writeDocMethods();
			}
			componentStr += this._writeDocFoot();
			return componentStr;
		}

		protected _writeDocHtmlComment(): string {
			let comment = null;
			let parser: htmlParser.Parser = new htmlParser.Parser({
				oncomment: (data) => {
					// console.log('_parseHtml parser.oncomment', data);
					if (data.indexOf('@demo') > -1 || data.indexOf('@hero') > -1) {
						comment = new HtmlComment();
						comment.comment = data;
					}
				}
			}, { decodeEntities: true });
			parser.write(fs.readFileSync(this.htmlFilePath));
			parser.end();
			return comment ? comment.toDocOnlyMarkup() : '';
		}

		protected _writeDocHead(): string {
			let headStr = '<dom-module id="' + this.name + '">\n';
			headStr += '\t<template>\n';
			headStr += '\t\t<style></style>\n';
			headStr += '\t\t<script>\n';
			headStr += '(function() {\n';
			headStr += '\tPolymer({\n';
			headStr += '\t\tis: \'' + this.name + '\',';
			return headStr;
		}

		protected _writeDocFoot(): string {
			let footStr = '\n\t});\n';
			footStr += '})();\n';
			footStr += '\t\t</script>\n';
			footStr += '\t</template>\n';
			footStr += '</dom-module>\n';
			return footStr;
		}

		protected _writeDocProperties(): string {
			let propertiesStr = '\n\t\tproperties: {';
			for (let i = 0; i < this.properties.length; i++) {
				let prop: Property = this.properties[i];
				propertiesStr += prop.toDocOnlyMarkup();
				propertiesStr += (i + 1) < this.properties.length ? ',' : '';
			}
			propertiesStr += '\n\t\t},';
			return propertiesStr;
		}

		protected _writeDocBehaviors(): string {
			let behaviorsStr = '\n\t\tbehaviors: [\n';
			for (let i = 0; i < this.behaviors.length; i++) {
				let behavior = this.behaviors[i];
				behaviorsStr += '\t\t\t' + behavior.toDocOnlyMarkup();
				behaviorsStr += (i + 1) < this.behaviors.length ? ',\n' : '';
			}
			behaviorsStr += '\n\t\t],'
			return behaviorsStr;
		}

		protected _writeDocListeners(): string {
			let listenersStr = '\n\t\tlisteners: {\n';
			for (let i = 0; i < this.listeners.length; i++) {
				let listener = this.listeners[i];
				listenersStr += listener.toDocOnlyMarkup();
				listenersStr += (i + 1) < this.listeners.length ? ',\n' : '';
			}
			listenersStr += '\n\t\t},';
			return listenersStr;
		}

		protected _writeDocMethods(): string {
			let methodsStr = '';
			for (let i = 0; i < this.methods.length; i++) {
				let method = this.methods[i];
				methodsStr += '\n' + method.toDocOnlyMarkup();
				methodsStr += (i + 1) < this.methods.length ? ',' : '';
			}
			return methodsStr;
		}

		protected _writeDocObservers(): string {
			let observersStr = '\n\t\tobservers: [\n';
			for (let i = 0; i < this.observers.length; i++) {
				let observer = this.observers[i];
				observersStr += observer.toDocOnlyMarkup();
				observersStr += (i + 1) < this.observers.length ? ',\n' : '';
			}
			observersStr += '\n\t\t\],';
			return observersStr;
		}
	}
	/**
	 * The type of program types generally found in a component
	 *
	 * @export
	 * @enum {number}
	 */
	export enum ProgramType {
		Property = "PROPERTY",
		Computed = "COMPUTED",
		Component = "COMPONENT",
		Behavior = "BEHAVIOR",
		Listener = "LISTENER",
		Observer = "OBSERVER",
		Function = "FUNCTION"
	}
	/**
	 * A comment for a program part
	 * @export
	 * @class Comment
	 */
	export class Comment {
		private _commentObj: any;
		private _commentText: string;
		private _endLineNum: number;
		private _isFor: ProgramType;
		private _startLineNum: number;
		private _tags: string[];

		get commentObj(): any {
			return this._commentObj;
		}
		/**
		 * The text of a comment
		 * @type {string}
		 */
		get commentText(): string {
			if (!this._commentText && this.commentObj) {
				this._commentText = this.commentObj.content;
			}
			return this._commentText;
		}

		set commentText(commentText) {
			this._commentText = commentText;
		}
		/**
		 * The comment ending line number
		 * @type {number}
		 */
		get endLineNum(): number {
			return this._endLineNum;
		}

		set endLineNum(endLineNum) {
			this._endLineNum = endLineNum;
		}
		/**
		 * What type of Program part is this comment for
		 * @type {ProgramType}
		 */
		get isFor(): ProgramType {
			return this._isFor;
		}

		set isFor(isFor) {
			this._isFor = isFor;
		}
		/**
		 * The comment starting line number
		 * @type {number}
		 */
		get startLineNum(): number {
			return this._startLineNum;
		}

		set startLineNum(startLineNum) {
			this._startLineNum = startLineNum;
		}
		/**
		 * The defined jsDoc tags in this comment
		 * @type {string}
		 */
		get tags(): string[] {
			return this._tags || [];
		}

		set tags(tags) {
			this._tags = tags;
		}

		private _getIndent() {
			let indentation = '\t\t\t';
			switch (this.isFor) {
				case ProgramType.Property:
					indentation = '\t\t\t';
					break;
				case ProgramType.Function:
					indentation = '\t\t';
					break;
				case ProgramType.Component:
					indentation = '\t';
					break;
				case ProgramType.Listener:
					indentation = '\t\t\t';
					break;
				case ProgramType.Behavior:
					indentation = '\t\t\t';
					break;
				case ProgramType.Computed:
					indentation = '\t\t\t';
					break;
				case ProgramType.Observer:
					indentation = '\t\t\t';
					break;
			}
			return indentation;
		}

		toDocOnlyMarkup() {
			let markup = this._getIndent() + '/**\n';
			markup += this._getIndent() + ' * ';
			markup += this.commentText ? this.commentText.replace(/\n/g, '\n' + this._getIndent() + ' * ') + '\n' : '\n';
			for (let i = 0; i < this.tags.length; i++) {
				let tag = this.tags[i];
				markup += this._getIndent() + ' * ' + tag + '\n';
			}
			markup += this._getIndent() + ' */\n';
			if (!this.commentText && (!this.tags || this.tags.length === 0)) {
				markup = '';
			}
			return markup;
		}
	}
	/**
	 * Class representing a function
	 * @export
	 * @class Function
	 * @extends {ProgramPart}
	 */
	export class Function extends ProgramPart {
		private _methodName: string;
		private _parameters: string[];
		private _returnType: string;
		private _signature: string;

		constructor(node?: ts.Node) {
			super();
			this.tsNode = node;
		}
		/**
		 * The name of the method
		 * @type {string}
		 */
		get methodName(): string {
			if (!this._methodName && this.tsNode) {
				let methodNode = null;
				if (this.tsNode.kind === ts.SyntaxKind.MethodDeclaration) {
					methodNode = <ts.MethodDeclaration> this.tsNode;
				}else if (this.tsNode.kind === ts.SyntaxKind.ArrowFunction) {
					methodNode = <ts.ArrowFunction> this.tsNode;
				}
				this._methodName = methodNode && methodNode.name ? methodNode.name.getText() : null;
			}
			return this._methodName;
		}

		set methodName(methodName) {
			this._methodName = methodName;
		}
		/**
		 * The provided arguments
		 * @type {string[]}
		 */
		get parameters(): string[] {
			if (!this._parameters && this.tsNode) {
				let params = [];
				let methodNode: ts.MethodDeclaration = <ts.MethodDeclaration>this.tsNode;
				let paramNodes = this.parseChildren(ts.SyntaxKind.Parameter, false);
				for (let i = 0; i < paramNodes.length; i++) {
					let paramNode: ts.ParameterDeclaration = <ts.ParameterDeclaration>paramNodes[i];
					if (paramNode.parent === this.tsNode) {
						params.push(paramNode.getText().replace(/\??:\s*[a-zA-Z]*/g, ''));
					}
				}
				this._parameters = params;
			}
			return this._parameters || [];
		}

		set parameters(parameters) {
			this._parameters = parameters || [];
		}
		/**
		 * The return type for this function. If the return type is not
		 * defined in the declaration (i.e. function foo()**: string** {...}) then
		 * this will be undefined
		 * @type {string}
		 */
		get returnType(): string {
			return this._returnType;
		}

		set returnType(returnType) {
			this._returnType = returnType;
		}
		/**
		 * The function signature NOT including the statements within the function
		 * @type {string}
		 */
		get signature(): string {
			if (!this._signature && this.methodName && this.parameters) {
				this._signature = this.methodName + '(';
				for (let i = 0; i < this.parameters.length; i++) {
					this._signature += this.parameters[i];
					this._signature += (i + 1) < this.parameters.length ? ', ' : '';
				}
				this._signature += ') {}';
			}
			return this._signature;
		}

		set signature(signature) {
			this._signature = signature;
		}

		toDocOnlyMarkup() {
			let comment = this.comment ? this.comment.toDocOnlyMarkup() : '';
			let functionStr = comment;
			functionStr += '\t\t' + this.signature;
			return functionStr;
		}
	}

	export class HtmlComment {
		private _comment: string;

		get comment() {
			return this._comment;
		}

		set comment(comment) {
			this._comment = comment;
		}

		toDocOnlyMarkup(): string {
			let commentStr = null;
			if (this.comment) {
				commentStr = '<!--\n';
				commentStr += this.comment;
				commentStr += '\n-->\n';
			}
			return commentStr;
		}
	}
	/**
	 * Class representing a declared event listener defined with @listen
	 * @export
	 * @class Listener
	 * @extends {ProgramPart}
	 */
	export class Listener extends ProgramPart {
		private _elementId: string;
		private _eventName: string;
		private _eventDeclaration: string;
		private _isExpression: boolean = false;
		private _methodName: string;

		constructor(node?: ts.Node) {
			super();
			this.tsNode = node;
		}
		/**
		 * The element ID this listener is for
		 * @type {string}
		 */
		get elementId(): string {
			if (!this._elementId && !this.isExpression && this.tsNode) {
				let sigArr: string[] = this.eventDeclaration ? this.eventDeclaration.split('.') : [];
				this._elementId = this.eventName ? sigArr[0] : null;
			}
			return this._elementId;
		}

		set elementId(elementId) {
			this._elementId = elementId;
		}
		/**
		 * The entire listener declaration
		 * @type {string}
		 */
		get eventDeclaration(): string {
			if (!this._eventDeclaration && this.tsNode) {
				if (this.tsNode.decorators && this.tsNode.decorators.length > 0) {
					this.tsNode.decorators.forEach((decorator: ts.Decorator, idx) => {
						let parseChildren = (decoratorChildNode) => {
							let kindStr = (<any>ts).SyntaxKind[decoratorChildNode.kind] + '=' + decoratorChildNode.kind;
							switch (decoratorChildNode.kind) {
								case ts.SyntaxKind.StringLiteral:
									let listenerStrNode = <ts.StringLiteral>decoratorChildNode;
									this._eventDeclaration = listenerStrNode.getText();
									break;
								case ts.SyntaxKind.PropertyAccessExpression:
									let listenerPropAccExp = <ts.PropertyAccessExpression>decoratorChildNode;
									this._eventDeclaration = listenerPropAccExp.getText();
									break;
							};
							ts.forEachChild(decoratorChildNode, parseChildren);
						};
						parseChildren(decorator);
					});
				}
			}
			return this._eventDeclaration;
		}

		set eventDeclaration(eventDeclaration) {
			this._eventDeclaration = eventDeclaration;
		}
		/**
		 * The name of the event. If listening for an event on an element, this
		 * will be something like 'click' or 'tap'
		 * @type {string}
		 */
		get eventName(): string {
			if (!this._eventName && this.tsNode) {
				let sigArr: string[] = this.eventDeclaration ? this.eventDeclaration.split('.') : [];
				this._eventName = sigArr[1] || null;
			}
			return this._eventName;
		}

		set eventName(name) {
			this._eventName = name;
		}
		/**
		 * True if this listner is defined via an expression
		 * @type {boolean}
		 */
		get isExpression(): boolean {
			if (!this._isExpression && this.tsNode) {
				if (this.tsNode.decorators && this.tsNode.decorators.length > 0) {
					this.tsNode.decorators.forEach((decorator: ts.Decorator, idx) => {
						let parseChildren = (decoratorChildNode) => {
							switch (decoratorChildNode.kind) {
								case ts.SyntaxKind.PropertyAccessExpression:
									this._isExpression = true;
									break;
							};
							ts.forEachChild(decoratorChildNode, parseChildren);
						};
						parseChildren(decorator);
					});
				}
			}
			return this._isExpression;
		}

		set isExpression(isExpression) {
			this._isExpression = isExpression;
		}
		/**
		 * The name of the handler for this listener
		 * @type {string}
		 */
		get methodName(): string {
			if (!this._methodName && this.tsNode) {
				let methodNode: ts.MethodDeclaration = <ts.MethodDeclaration>this.tsNode;
				this._methodName = methodNode.name.getText();
			}
			return this._methodName;
		}

		set methodName(methodName) {
			this._methodName = methodName;
		}

		toDocOnlyMarkup() {
			let comment = this.comment ? this.comment.toDocOnlyMarkup() : '';
			let listenerStr = comment;
			let eventName = this.eventDeclaration ? this.eventDeclaration.replace(/['"]/g, '') : '';
			listenerStr += '\t\t\t\'' + eventName + '\'';
			listenerStr += ': ';
			listenerStr += '\'' + this.methodName + '\'';
			return listenerStr;
		}
	}
	/**
	 * Class representing an observer defined with @observe
	 *
	 * @export
	 * @class Observer
	 * @extends {ProgramPart}
	 */
	export class Observer extends ProgramPart {
		private _properties: string[];
		private _methodName: string;
		private _isComplex: boolean = false;

		constructor(node?: ts.Node) {
			super();
			this.tsNode = node;
		}
		/**
		 * True if the observer declaration is for an object property or more
		 * than 1 property is defined. (i.e. @computed('foo.*') or @computed('foo','bar'))
		 * @type {boolean}
		 */
		get isComplex(): boolean {
			if (!this._isComplex && this.tsNode) {
				if (this.properties && this.properties.length > 0) {
					this.properties.forEach((prop) => {
						if (prop.indexOf('.') > -1) {
							this._isComplex = true;
						}
					});
					if (!this._isComplex && this.properties.length > 1) {
						this._isComplex = true;
					}
				}

			}
			return this._isComplex;
		}

		set isComplex(isComplex) {
			this._isComplex = isComplex;
		}
		/**
		 * The name of the method for this observer
		 * @type {string}
		 */
		get methodName(): string {
			if (!this._methodName && this.tsNode) {
				let methodNode: ts.MethodDeclaration = <ts.MethodDeclaration>this.tsNode;
				this._methodName = methodNode.name.getText();
			}
			return this._methodName;
		}

		set methodName(methodName) {
			this._methodName = methodName;
		}
		/**
		 * Array of properties this observer listens to
		 * @type {string[]}
		 */
		get properties(): string[] {
			if (!this._properties && this.tsNode) {
				let props = [];
				if (this.tsNode.decorators && this.tsNode.decorators.length > 0) {
					this.tsNode.decorators.forEach((decorator: ts.Decorator) => {
						let parseChildren = (decoratorChildNode: ts.Node) => {
							if (decoratorChildNode.kind === ts.SyntaxKind.StringLiteral) {
								let observerStrNode = <ts.StringLiteral>decoratorChildNode;
								let propsStr = observerStrNode.getText();
								propsStr = propsStr.replace(/[\s']*/g, '');
								if (propsStr.indexOf(',') > -1) {
									props = props.concat(propsStr.split(','));
								}else {
									props.push(propsStr);
								}
							}
							ts.forEachChild(decoratorChildNode, parseChildren);
						};
						parseChildren(decorator);
					});
				}
				this._properties = props;
			}
			return this._properties;
		}

		set properties(properties) {
			this._properties = properties;
		}

		// TODO Fix this
		toDocOnlyMarkup() {
			let comment = this.comment ? this.comment.toDocOnlyMarkup() : '';
			let observerStr = comment;
			observerStr += '\t\t\t\'' + this.methodName + '(';
			for (let i = 0; i < this.properties.length; i++) {
				let prop = this.properties[i];
				observerStr += prop;
				observerStr += (i + 1) < this.properties.length ? ',' : '';
			}
			observerStr += ')\'';
			return observerStr;
		}
	}
	/**
	 * Class representing a declared property defined using @property
	 *
	 * @export
	 * @class Property
	 * @extends {ProgramPart}
	 */
	export class Property extends ProgramPart {
		private _containsValueArrayLiteral: boolean = false;
		private _containsValueFunction: boolean = false;
		private _containsValueObjectDeclaration: boolean = false;
		private _name: string;
		protected _params: string;
		private _type: string;
		private _valueArrayParams: any;
		private _valueFunction: Function;
		private _valueObjectParams: any;

		constructor(node?: ts.Node) {
			super();
			this.tsNode = node;
		}

		get derivedComment(): Comment {
			if (!this.comment || !this.comment.commentText) {
				this.comment = this.comment ? this.comment : new Comment();
				let type = this.type || 'Object';
				this.comment.tags = ['@type {' + type + '}']
				this.comment.isFor = ProgramType.Property;
			}
			return this.comment;
		}

		get containsValueArrayLiteral(): boolean {
			if (!this._containsValueArrayLiteral && this.tsNode) {
				let parseChildren = (childNode: ts.Node) => {
					if (childNode.kind === ts.SyntaxKind.ArrayLiteralExpression) {
						let arrayLiteral = <ts.ArrayLiteralExpression>childNode;
						this._containsValueArrayLiteral = true;
					}
					ts.forEachChild(childNode, parseChildren);
				}
				parseChildren(this.tsNode);
			}
			return this._containsValueArrayLiteral;
		}

		set containsValueArrayLiteral(containsValueArrayLiteral) {
			this._containsValueArrayLiteral = containsValueArrayLiteral;
		}

		get containsValueFunction(): boolean {
			if (!this._containsValueFunction && this.tsNode) {
				let parseChildren = (childNode: ts.Node) => {
					if (childNode.kind === ts.SyntaxKind.ArrowFunction) {
						this._containsValueFunction = true;
					} else if (childNode.kind === ts.SyntaxKind.MethodDeclaration) {
						this._containsValueFunction = true;
					}
					ts.forEachChild(childNode, parseChildren);
				}
				parseChildren(this.tsNode);
			}
			return this._containsValueFunction;
		}

		set containsValueFunction(containsValueFunction) {
			this._containsValueFunction = containsValueFunction;
		}

		get containsValueObjectDeclaration(): boolean {
			if (!this._containsValueObjectDeclaration && this.tsNode) {
				// let insideProperty = false;
				let insideProperty = false;
				let parseChildren = (childNode: ts.Node) => {
					if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
						if (!insideProperty) {
							insideProperty = true;
						} else {
							this._containsValueObjectDeclaration = true;
						}
					}
					ts.forEachChild(childNode, parseChildren);
				}
				parseChildren(this.tsNode);
			}
			return this._containsValueObjectDeclaration;
		}

		set containsValueObjectDeclaration(containsValueObjectDeclaration) {
			this._containsValueObjectDeclaration = containsValueObjectDeclaration;
		}

		get name(): string {
			if (!this._name && this.tsNode) {
				let propNode: ts.PropertyDeclaration = <ts.PropertyDeclaration>this.tsNode;
				this._name = propNode.name.getText();
			}
			return this._name;
		}

		set name(name) {
			this._name = name;
		}

		get params(): string {
			if (!this._params && this.tsNode) {
				let insideProperty = false;
				let parseChildren = (childNode: ts.Node) => {
					console.log('Property.params.parseChildren, childNode kind=', (<any>ts).SyntaxKind[childNode.kind]);
					console.log('Property.params.parseChildren, parentNode kind=', (<any>ts).SyntaxKind[childNode.parent.kind]);
					if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
						let objExp = <ts.ObjectLiteralExpression>childNode;
						if (!insideProperty) {
							let objLiteralObj = getObjectLiteralString(objExp);
							this._params = objLiteralObj.str;
							insideProperty = true;
						}
					}
					ts.forEachChild(childNode, parseChildren);
				};
				parseChildren(this.tsNode);
			}
			return this._params;
		}

		set params(params) {
			this._params = params;
		}

		get type(): string {
			if (!this._type && this.tsNode) {
				let insideProperty = false;
				let parseChildren = (childNode: ts.Node) => {
					if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
						let objExp = <ts.ObjectLiteralExpression>childNode;
						if (!insideProperty) {
							let objLiteralObj = RedPill.getObjectLiteralString(objExp);
							this._type = objLiteralObj.type;
							insideProperty = true;
						}
					}
					ts.forEachChild(childNode, parseChildren);
				}
				parseChildren(this.tsNode);
			}
			return this._type;
		}

		set type(type) {
			this._type = type;
		}
		/**
		 * A string with the array value definition. This would be populated if a property
		 * is of type 'Array' with a value property that defines that array
		 * @type {string}
		 */
		get valueArrayParams(): any {
			if (!this._valueArrayParams && this.tsNode) {
				let parseChildren = (childNode: ts.Node) => {
					if (childNode.kind === ts.SyntaxKind.ArrayLiteralExpression) {
						let arrayLiteral = <ts.ArrayLiteralExpression>childNode;
						this._valueArrayParams = arrayLiteral.getText();
					}
					ts.forEachChild(childNode, parseChildren);
				}
				parseChildren(this.tsNode);
			}
			return this._valueArrayParams;
		}

		set valueArrayParams(valueArrayParams) {
			this._valueArrayParams = valueArrayParams;
		}
		/**
		 * If a property is defined with a value function, this is the defined
		 * function
		 * @type {Function}
		 */
		get valueFunction(): Function {
			if (!this._valueFunction && this.tsNode) {
				let parseChildren = (childNode: ts.Node) => {
					let childKind = childNode.kind;
					if (childKind === ts.SyntaxKind.MethodDeclaration || childKind === ts.SyntaxKind.ArrowFunction) {
						this._valueFunction = new Function(childNode);
					}
					ts.forEachChild(childNode, parseChildren);
				}
				parseChildren(this.tsNode);
			}
			return this._valueFunction;
		}

		set valueFunction(valueFunction) {
			this._valueFunction = valueFunction;
		}
		/**
		 * If a property is defined with an object literal as it's value, this is that object
		 * @type {string}
		 */
		get valueObjectParams(): any {
			if (!this._valueObjectParams && this.tsNode) {
				let insideProperty = false;
				let parseChildren = (childNode: ts.Node) => {
					if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
						let objExp = <ts.ObjectLiteralExpression>childNode;
						if (!insideProperty) {
							insideProperty = true;
						} else {
							this._valueObjectParams = RedPill.getObjectLiteralString(objExp).str;
						}
					}
					ts.forEachChild(childNode, parseChildren);
				}
				parseChildren(this.tsNode);
			}
			return this._valueObjectParams;
		}

		set valueObjectParams(valueParams) {
			this._valueObjectParams = valueParams;
		}
		/**
		 * Parse the parameters of this property
		 * @private
		 * @returns {string}
		 */
		private _parseParams(): string {
			let partsArr = this.params ? this.params.split(',') : [];
			let newParamStr = '{\n';
			for (let i = 0; i < partsArr.length; i++) {
				let part = partsArr[i];
				if (this.containsValueFunction && part.indexOf('value:') > -1) {
					newParamStr += this._parseValueFunction(part);
					newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
				} else if (this.containsValueObjectDeclaration && part.indexOf('value:') > -1) {
					newParamStr += '\t\t\t\t' + this._parseValueObject();
					let valueLen = this.valueObjectParams ? this.valueObjectParams.split(',').length - 1 : 0;
					newParamStr += (i + 1) < (partsArr.length - valueLen) ? ',\n' : '\n';
				} else if (this.containsValueArrayLiteral && part.indexOf('value:') > -1) {
					newParamStr += '\t\t\t\t' + this._parseValueArray();
					let valueLen = this.valueArrayParams ? this.valueArrayParams.split(',').length - 1 : 0;
					newParamStr += (i + 1) < (partsArr.length - valueLen) ? ',\n' : '\n';
				} else {
					let regEx = /[/{/}\n\t]/g;
					if (part.indexOf('type') > -1) {
						regEx = /[/{/}\n\t']/g;
					}
					if ((this.containsValueObjectDeclaration || this.containsValueArrayLiteral) && !this._isPartOfValue(part)) {
						newParamStr += '\t\t\t\t' + part.replace(regEx, '');
						newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
					} else if (!this.containsValueObjectDeclaration && !this.containsValueArrayLiteral) {
						newParamStr += '\t\t\t\t' + part.replace(regEx, '');
						newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
					}
				}
			}
			newParamStr += '\t\t\t}';
			return newParamStr;
		}

		private _isPartOfValue(part: string): boolean {
			let partOfValue = false;
			if (part && this.containsValueObjectDeclaration) {
				let valueObj = getObjectFromString(this.valueObjectParams);
				let partMatch = /(?:^[\{\s"]*([a-zA-Z0-9]+):(?:.)*)/.exec(part);
				if (partMatch) {
					let key = partMatch[1];
					partOfValue = valueObj.hasOwnProperty(key);
				}
			} else if (part && this.containsValueArrayLiteral) {
				let valueArr = getArrayFromString(this.valueArrayParams);
				let partMatch = /(?:['"\s]*([a-zA-Z]*)['"\s]*)/.exec(part);
				if (partMatch && partMatch[1]) {
					let key = partMatch[1];
					partOfValue = valueArr.indexOf(key) > -1;
				}
			}
			return partOfValue;
		}
		/**
		 * If this property contains a value property that is an array, this will
		 * parse that array object and return an appropriate string
		 * @private
		 * @returns {string}
		 */
		private _parseValueArray(): string {
			let valueArrStr = 'value: [';
			let arrayParts = this.valueArrayParams.split(',');
			for (let i = 1; i < arrayParts.length; i++) {
				let part = arrayParts[i];
				if (i === 1) {
					valueArrStr += '\n';
				}
				valueArrStr += '\t' + part.replace(/[\]\[\n]/g, '');
				valueArrStr += (i + 1) < arrayParts.length ? ',\n' : '\n';
			}
			if (arrayParts.length > 1) {
				valueArrStr += '\t\t\t\t]';
			} else {
				valueArrStr += ']';
			}
			return valueArrStr;
		}
		/**
		 * If this property contains a value property that is an object literal, this will
		 * parse that object literal and return an appropriate string
		 * @private
		 * @returns {string}
		 */
		private _parseValueObject(): string {
			let objStr = 'value: {';
			let partsArr = this.valueObjectParams ? this.valueObjectParams.split(',') : [];
			for (let i = 0; i < partsArr.length; i++) {
				let part = partsArr[i];
				if (i === 0) {
					objStr += '\n';
				}
				objStr += '\t\t\t\t\t' + part.replace(/[/{/}\n\t]/g, '');
				objStr += (i + 1) < partsArr.length ? ',\n' : '\n';
			}
			if (partsArr.length > 1) {
				objStr += '\t\t\t\t}';
			} else {
				objStr += '}';
			}
			return objStr;
		}
		/**
		 * This assumes a very simple function. Meaning no loops or conditional statements
		 * If loops or conditional statements are encountered, the indentation will not be
		 * correct for those
		 * @private
		 * @param {any} valueFunctionPart
		 * @returns {string}
		 */
		private _parseValueFunction(valueFunctionPart): string {
			let funcStr = '';
			if (valueFunctionPart) {
				let funcArr = valueFunctionPart.split('\n');
				let idx = 0;
				funcArr.forEach((element) => {
					if ((idx === 0 && element) || (idx === 1 && element)) {
						funcStr += '\t\t\t' + element.replace(/\n\t/g, '') + '\n';
					} else if (idx === funcArr.length - 1) {
						funcStr += '\t' + element.replace(/\n\t/g, '');
					} else if (element) {
						funcStr += '\t' + element.replace(/\n\t/g, '') + '\n';
					}
					idx++;
				});
			}
			return funcStr;
		}
		/**
		 * Builds the string representation of this property
		 * @returns {string}
		 * @todo If there isn't a comment, we should have everything we need to create one
		 */
		toDocOnlyMarkup(): string {
			let nameParts = this.name.split(':');
			let comment = this.comment && this.comment.commentText ? '\n' + this.comment.toDocOnlyMarkup() : '\n' + this.derivedComment.toDocOnlyMarkup();
			let propStr = comment;
			propStr += '\t\t\t' + nameParts[0];
			propStr += ': ';
			propStr += this._parseParams();
			return propStr;
		}
	}
	/**
	 * Class representing a computed property defined with @computed
	 * @export
	 * @class ComputedProperty
	 * @extends {Property}
	 */
	export class ComputedProperty extends Property {
		private _derivedMethodName: string;
		private _methodName: string;
		/**
		 * If this computed property only contains a single property in it's definition
		 * then this can be used to move that computed property to a declared property with
		 * an observer definition
		 * @type {string}
		 */
		get derivedMethodName(): string {
			if (!this._derivedMethodName && this.tsNode) {
				let methodNode = <ts.MethodDeclaration>this.tsNode;
				this._derivedMethodName = '_get' + capitalizeFirstLetter(methodNode.name.getText().replace(/_/g, ''));
			}
			return this._derivedMethodName;
		}

		set derivedMethodName(methodName) {
			this._derivedMethodName = methodName;
		}
		/**
		 * The actual method name of the method this observer is for
		 * @type {string}
		 */
		get methodName(): string {
			if (!this._methodName && this.tsNode) {
				let methodNode = <ts.MethodDeclaration>this.tsNode;
				this._methodName = methodNode.name.getText();
			}
			return this._methodName;
		}

		set methodName(methodName) {
			this._methodName = methodName;
		}

		/* get params() {
			if (!this.params && this.tsNode) {
				let insideProp = false;
				let parseChildren = (childNode: ts.Node) => {
					if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression && !insideProp) {

						insideProp = true;
					}
				}
				parseChildren(this.tsNode);
			}
			return this._params;
		} */
		// TODO: Need to implement this so it adds the computed: methodName
		private _getNewParams(): string {
			let partsArr = this.params ? this.params.split(',') : [];
			let hasType = partsArr.find((part) => {
				return part.indexOf('type:') > -1;
			});
			if (!hasType) {
				partsArr.unshift('type: Object');
			}
			let newParamStr = '{\n';
			for (let i = 0; i < partsArr.length; i++) {
				let part = partsArr[i];
				newParamStr += '\t\t\t\t' + part.replace(/[/{/}\n\t]/g, '');
				newParamStr += ',\n';
			}
			newParamStr += '\t\t\t\tcomputed: \'' + this.derivedMethodName + '\'\n';
			newParamStr += '\t\t\t}';
			return newParamStr;
		}

		toDocOnlyMarkup() {
			let nameParts = this.name.split(':');
			let comment = this.comment && this.comment.commentText ? '\n' + this.comment.toDocOnlyMarkup() : '\n' + this.derivedComment.toDocOnlyMarkup();
			let propStr = comment;
			propStr += '\t\t\t' + nameParts[0];
			propStr += ': ';
			propStr += this._getNewParams();
			return propStr;
		}
	}

/************ UTIL Functions to make repetitive tasks easier ***********/
	/**
	 * An empty class for the PathInfo object. Used mainly for property
	 * checking and typeahead
	 * @export
	 * @class PathInfo
	 */
	export class PathInfo {
		fileName: string;
		dirName: string;
		docFileName: string;
		fullDocFilePath: string;
		htmlFileName: string;
		fullHtmlFilePath: string;
	}
	/**
	 * Trim all whitespace to the right of a string
	 * @export
	 * @param {any} str
	 * @returns {string}
	 */
	export function trimRight(str): string {
		return str.replace(/\s+$/, '');
	}
	/**
	 * Trim all tabs from a string
	 * @export
	 * @param {any} str
	 * @returns {string}
	 */
	export function trimTabs(str): string {
		return str.replace(/\t+/g, '');
	}
	/**
	 * Trim all whitespace from a string
	 * @export
	 * @param {any} str
	 * @returns {string}
	 */
	export function trimAllWhitespace(str): string {
		return str.replace(/\s*/g, '');
	}
	/**
	 * Build a string from an object literal node
	 * @export
	 * @param {ts.ObjectLiteralExpression} objExp
	 * @returns {any}
	 */
	export function getObjectLiteralString(objExp: ts.ObjectLiteralExpression): any {
		let objLiteralObj:any = {};
		if (objExp && objExp.properties && objExp.properties.length > 0) {
			let paramStr = '{\n';
			for (let i = 0; i < objExp.properties.length; i++) {
				let propProperty: ts.PropertyAssignment = (<ts.PropertyAssignment>objExp.properties[i]);
				let propPropertyKey = propProperty.name.getText();
				paramStr += '\t' + propProperty.name.getText();
				paramStr += ': ';
				paramStr += propProperty.initializer.getText();
				paramStr += (i + 1) < objExp.properties.length ? ',' : '';
				paramStr += '\n';
				if (propPropertyKey === 'type') {
					objLiteralObj.type = propProperty.initializer.getText();
				}
			}
			paramStr += '}';
			objLiteralObj.str = paramStr;
		}
		return objLiteralObj;
	}
	/**
	 * Build a String from an Object
	 * @export
	 * @param {*} obj
	 * @returns {string}
	 */
	export function getStringFromObject(obj: any): string {
		let objStr = null;
		if (obj) {
			let objLength = Object.keys(obj).length;
			objStr = '{\n';
			let idx = 0;
			for (let key in obj) {
				let objVal = '\'' + obj[key] + '\'';
				if (typeof (obj[key]) === 'boolean') {
					objVal = obj[key];
				}
				objStr += '\t' + key + ': ' + objVal;
				objStr += (idx + 1) < objLength ? ',\n' : '\n';
				idx++;
			}
			objStr += '}';
		}
		return objStr;
	}
	/**
	 * Get an object from a string formatted as an object
	 * @export
	 * @param {string} objectStr
	 * @returns {any}
	 */
	export function getObjectFromString(objectStr: string): any {
		let params = {};
		let partsArr = objectStr ? objectStr.split(',') : [];
		for (let i = 0; i < partsArr.length; i++) {
			let part = partsArr[i];
			let partStr = part.replace(/[/{/}\n\t]/g, '');
			partStr = trimAllWhitespace(partStr);
			let partArr: any[] = partStr.split(':');
			partArr[1] = partArr[1] === 'true' ? true : partArr[1];
			partArr[1] = partArr[1] === 'false' ? false : partArr[1];
			params[partArr[0]] = partArr[1];
		}
		return params;
	}
	/**
	 * Produce an array from a string which is formatted as an array
	 * @export
	 * @param {string} arrayStr
	 * @returns {any}
	 */
	export function getArrayFromString(arrayStr: string): any {
		let arr = [];
		if (arrayStr) {
			let partsArr = arrayStr.replace(/[\[\]]/g, '').split(',');
			for (let i = 0; i < partsArr.length; i++) {
				let part = partsArr[i];
				if (part) {
					let partStr = part.replace(/[\n\t\[\]'"]/g, '');
					partStr = trimAllWhitespace(partStr);
					arr.push(partStr);
				}
			}
		}
		return arr;
	}
	/**
	 * Get the pieces of the path for fileName
	 * @param {string} fileName
	 * @returns {any} pathInfo
	 * @property {string} pathInfo.fileName - The original source file name
	 * @property {string} pathInfo.dirName - The directory name for fileName
	 * @property {string} pathInfo.docFileName - The generated documentation file name
	 * @property {string} pathInfo.fullDocFilePath - The full path to pathInfo.docFileName
	 */
	export function getPathInfo(fileName: string, docPath: string): PathInfo {
		let pathInfo: PathInfo = new PathInfo;
		if (fileName) {
			let fileNameExt = path.extname(fileName);
			pathInfo.fileName = fileName;
			pathInfo.dirName = docPath;
			pathInfo.docFileName = 'doc_' + path.basename(fileName).replace(fileNameExt, '.html');
			pathInfo.fullDocFilePath = path.join(docPath, pathInfo.docFileName);
			pathInfo.htmlFileName = path.basename(fileName).replace(fileNameExt, '.html');
			pathInfo.fullHtmlFilePath = path.join(path.dirname(fileName), pathInfo.htmlFileName);
		}
		return pathInfo;
	}
	/**
	 * Get the starting line number for a node
	 * @export
	 * @param {ts.Node} node
	 * @returns {number}
	 */
	export function getStartLineNumber(node: ts.Node): number {
		let lineObj = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
		return lineObj.line + 1;
	}
	/**
	 * Get the ending line number for a node
	 * @export
	 * @param {ts.Node} node
	 * @returns {number}
	 */
	export function getEndLineNumber(node: ts.Node): number {
		let lineObj = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getEnd());
		return lineObj.line + 1;
	}
	/**
	 * Capitalize the first letter of a string
	 * @export
	 * @param {string} str
	 * @returns {string}
	 */
	export function capitalizeFirstLetter(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	/**
	 * Determine if a property is a child of the Component node
	 * @export
	 * @param {ts.Node} parentNode The property's parent node
	 * @param {Component} component The component
	 * @returns {boolean}
	 */
	export function isNodeComponentChild(parentNode: ts.Node, component: Component): boolean {
		let isComponent = false;
		if (ts.isClassDeclaration(parentNode) && component) {
			let classDecl = <ts.ClassDeclaration>parentNode;
			if (classDecl.name.getText() === component.className) {
				isComponent = true;
			}
		}
		return isComponent;
	}
	/**
	 * Create a method from the listener
	 * @export
	 * @param {Listener} listener
	 * @returns {Function}
	 */
	export function getMethodFromListener(listener: Listener): Function {
		let listenerMethod = null;
		if (listener) {
			if (listener.methodName) {
				listenerMethod = new Function();
				listenerMethod.methodName = listener.methodName;
				listenerMethod.parameters = ['evt'];
				listenerMethod.comment = listener.comment || new Comment();
				if (!listener.comment) {
					listenerMethod.comment.commentText = '';
				}
				listenerMethod.comment.isFor = ProgramType.Function;
				let tags = listenerMethod.comment.tags || [];
				let hasListensTag = tags.find((tag) => {
					return tag.indexOf('@listens') > -1;
				});
				if (!hasListensTag) {
					tags.push('@listens #' + listener.eventDeclaration);
				}
				if (!listenerMethod.comment.tags || listenerMethod.comment.tags.length === 0) {
					listenerMethod.comment.tags = tags;
				}
				listener.comment = null;
			}
			return listenerMethod;
		}
	}
	/**
	 * Create a method from a computed property
	 * @export
	 * @param {ComputedProperty} computed
	 * @returns {Function}
	 */
	export function getMethodFromComputed(computed: ComputedProperty): Function {
		let computedMethod = null;
		if (computed) {
			if (computed.derivedMethodName) {
				computedMethod = new Function();
				computedMethod.methodName = computed.derivedMethodName;
				if (computed.comment) {
					computedMethod.comment = new Comment();
					computedMethod.comment.commentText = computed.comment.commentText;
					computedMethod.comment.endLineNumber = computed.comment.endLineNum;
					computedMethod.comment.startLineNumber = computed.comment.startLineNum;
					computedMethod.comment.tags = computed.comment.tags || [];
					computedMethod.comment.isFor = ProgramType.Function;
				}
			}
		}
		return computedMethod;
	}
	/**
	 * Create a method from an observer
	 * @export
	 * @param {Observer} observer
	 * @returns {Function}
	 */
	export function getMethodFromObserver(observer: Observer): Function {
		let observerMethod: Function = null;
		if (observer) {
			if (observer.methodName) {
				observerMethod = new Function();
				observerMethod.methodName = observer.methodName;
				if (observer.properties && observer.properties.length > 0) {
					let paramArr = [];
					for (let i = 0; i < observer.properties.length; i++) {
						let prop = observer.properties[i];
						let propVal = null;
						if (prop.indexOf('.') > -1) {
							propVal = prop.split('.')[1];
						} else {
							propVal = prop;
						}
						paramArr.push(propVal);
					}
					observerMethod.parameters = paramArr;
				}
				observerMethod.comment = observer.comment || new Comment();
				observerMethod.comment.isFor = ProgramType.Function;
				if (!observer.comment) {
					observerMethod.comment.commentText = '';
				}
				observer.comment = null;
			}
		}
		return observerMethod;
	}
	/**
	 * Determine of the passed in node matches the pattern of a
	 * computed property. Mainly, is the decorator have a name of 'computed'
	 * and all the other relevant bits are present
	 * @param {ts.MethodDeclaration} node
	 * @returns {boolean}
	 */
	export function isComputedProperty(node: ts.MethodDeclaration): boolean {
		let isComputed = false;
		if (node && node.decorators && node.decorators.length > 0) {
			node.decorators.forEach((val: ts.Decorator, idx: number) => {
				let exp = val.expression;
				let expText = exp.getText();
				let decoratorMatch = /\s*(?:computed)\s*\((?:\{*(.*)\}*)\)/.exec(expText);
				isComputed = decoratorMatch && decoratorMatch.length > 0 ? true : false;
			});
		}
		return isComputed;
	}
	/**
	 * Determine if the passed in node matches the pattern of a
	 * listener. Mainly, does the decorator have a name of 'listen'
	 * and all the other relevant bits are present
	 * @param {ts.MethodDeclaration} node
	 * @returns {boolean}
	 */
	export function isListener(node: ts.MethodDeclaration): boolean {
		let isListener = false;
		if (node && node.decorators && node.decorators.length > 0) {
			node.decorators.forEach((val: ts.Decorator, idx: number) => {
				let exp = val.expression;
				let expText = exp.getText();
				let decoratorMatch = /\s*(?:listen)\s*\((?:\{*(.*)\}*)\)/.exec(expText);
				isListener = decoratorMatch && decoratorMatch.length > 0 ? true : false;
			});
		}
		return isListener;
	}
	/**
	 * Determine if the passed in node matches the pattern of a
	 * observer. Mainly, does the decorator have a name of 'observe'
	 * and all the other relevant bits are present
	 * @param {ts.MethodDeclaration} node
	 * @returns {boolean}
	 */
	export function isObserver(node: ts.MethodDeclaration): boolean {
		let isObserver = false;
		if (node && node.decorators && node.decorators.length > 0) {
			node.decorators.forEach((val: ts.Decorator, idx: number) => {
				let exp = val.expression;
				let expText = exp.getText();
				let decoratorMatch = /\s*(?:observe)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(expText);
				isObserver = decoratorMatch && decoratorMatch.length > 0 ? true : false;
			});
		}
		return isObserver;
	}
}
export default {RedPill};
