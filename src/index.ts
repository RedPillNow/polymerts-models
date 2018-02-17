import * as fs from 'fs';
import * as htmlParser from 'htmlparser2';
import * as path from 'path';
import * as ts from 'typescript';

export module RedPill {
	export abstract class ProgramPart {
		private _comment: Comment;
		private _endLineNum: number;
		private _startLineNum: number;
		private _tsNode: ts.Node;

		abstract toDocOnlyMarkup(): string;

		public get comment() {
			if (this._comment === undefined && this.tsNode) {
				let tsNodeAny = (<any>this.tsNode);
				if (tsNodeAny.jsDoc && tsNodeAny.jsDoc.length > 0) {
					let comm:Comment = new Comment();
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

		get endLineNum() {
			return this._endLineNum;
		}

		set endLineNum(endLineNum) {
			this._endLineNum = endLineNum;
		}

		get startLineNum() {
			return this._startLineNum;
		}

		set startLineNum(startLineNum) {
			this._startLineNum = startLineNum;
		}

		get tsNode() {
			return this._tsNode;
		}

		set tsNode(tsNode) {
			this._tsNode = tsNode;
		}
	}

	export class Behavior extends ProgramPart {
		private _name: string;

		get name() {
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

	export class Component extends ProgramPart {
		private _behaviors: Behavior[];
		private _className: string;
		private _extendsClass: string;
		private _filePath: string;
		private _htmlFilePath: string;
		private _listeners: Listener[];
		private _methods: any[];
		private _name: string;
		private _namespace: string;
		private _observers: Observer[];
		private _properties: Property[];

		get behaviors() {
			return this._behaviors || [];
		}

		set behaviors(behaviors) {
			this._behaviors = behaviors;
		}

		get className() {
			return this._className;
		}

		set className(className) {
			this._className = className;
		}

		get extendsClass() {
			return this._extendsClass;
		}

		set extendsClass(extendsClass) {
			this._extendsClass = extendsClass;
		}

		get filePath() {
			return this._filePath;
		}

		set filePath(filePath) {
			this._filePath = filePath;
		}

		get htmlFilePath() {
			return this._htmlFilePath;
		}

		set htmlFilePath(htmlFilePath) {
			this._htmlFilePath = htmlFilePath;
		}

		get listeners() {
			return this._listeners || [];
		}

		set listeners(listeners) {
			this._listeners = listeners;
		}

		get methods() {
			return this._methods || [];
		}

		set methods(methods) {
			this._methods = methods;
		}

		get name() {
			return this._name;
		}

		set name(name) {
			this._name = name;
		}

		get namespace() {
			return this._namespace;
		}

		set namespace(namespace) {
			this._namespace = namespace;
		}

		get observers() {
			return this._observers || [];
		}

		set observers(observers) {
			this._observers = observers;
		}

		get properties() {
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

	export enum ProgramType {
		Property = "PROPERTY",
		Computed = "COMPUTED",
		Component = "COMPONENT",
		Behavior = "BEHAVIOR",
		Listener = "LISTENER",
		Observer = "OBSERVER",
		Function = "FUNCTION"
	}

	export class Comment {
		private _commentObj: any;
		private _commentText: string;
		private _endLineNum: number;
		private _isFor: ProgramType;
		private _startLineNum: number;
		private _tags: string[];

		get commentObj() {
			return this._commentObj;
		}

		get commentText() {
			if (!this._commentText && this.commentObj) {
				this._commentText = this.commentObj.content;
			}
			return this._commentText;
		}

		set commentText(commentText) {
			this._commentText = commentText;
		}

		get endLineNum() {
			return this._endLineNum;
		}

		set endLineNum(endLineNum) {
			this._endLineNum = endLineNum;
		}

		get isFor() {
			return this._isFor;
		}

		set isFor(isFor) {
			this._isFor = isFor;
		}

		get startLineNum() {
			return this._startLineNum;
		}

		set startLineNum(startLineNum) {
			this._startLineNum = startLineNum;
		}

		get tags() {
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

	export class Function extends ProgramPart {
		private _methodName: string;
		private _parameters: string[];
		private _returnType: string;
		private _signature: string;

		get methodName() {
			return this._methodName;
		}

		set methodName(methodName) {
			this._methodName = methodName;
		}

		get parameters() {
			return this._parameters || [];
		}

		set parameters(parameters) {
			this._parameters = parameters || [];
		}

		get returnType() {
			return this._returnType;
		}

		set returnType(returnType) {
			this._returnType = returnType;
		}

		get signature() {
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

	export class Listener extends ProgramPart {
		private _elementId: string;
		private _eventName: string;
		private _eventDeclaration: string;
		private _isExpression: boolean = false;
		private _methodName: any;

		get elementId() {
			return this._elementId;
		}

		set elementId(elementId) {
			this._elementId = elementId;
		}

		get eventDeclaration() {
			return this._eventDeclaration;
		}

		set eventDeclaration(eventDeclaration) {
			this._eventDeclaration = eventDeclaration;
		}

		get eventName() {
			return this._eventName;
		}

		set eventName(name) {
			this._eventName = name;
		}

		get isExpression() {
			return this._isExpression;
		}

		set isExpression(isExpression) {
			this._isExpression = isExpression;
		}

		get methodName() {
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

	export class Observer extends ProgramPart {
		private _properties: string[];
		private _methodName: any;

		get properties(): string[] {
			return this._properties;
		}

		set properties(properties) {
			this._properties = properties;
		}

		get methodName() {
			return this._methodName;
		}

		set methodName(methodName) {
			this._methodName = methodName;
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

	export class Property extends ProgramPart {
		private _containsValueArrayLiteral: boolean = false;
		private _containsValueFunction: boolean = false;
		private _containsValueObjectDeclaration: boolean = false;
		private _name: string;
		private _params: string;
		private _type: string;
		private _valueArrayParams: any;
		private _valueObjectParams: any;

		get derivedComment(): Comment {
			if (!this.comment || !this.comment.commentText) {
				this.comment = this.comment ? this.comment : new Comment();
				let type = this.type || 'Object';
				this.comment.tags = ['@type {' + type + '}']
				this.comment.isFor = ProgramType.Property;
			}
			return this.comment;
		}

		get containsValueArrayLiteral() {
			return this._containsValueArrayLiteral;
		}

		set containsValueArrayLiteral(containsValueArrayLiteral) {
			this._containsValueArrayLiteral = containsValueArrayLiteral;
		}

		get containsValueFunction() {
			return this._containsValueFunction;
		}

		set containsValueFunction(containsValueFunction) {
			this._containsValueFunction = containsValueFunction;
		}

		get containsValueObjectDeclaration() {
			return this._containsValueObjectDeclaration;
		}

		set containsValueObjectDeclaration(containsValueObjectDeclaration) {
			this._containsValueObjectDeclaration = containsValueObjectDeclaration;
		}

		get name() {
			return this._name;
		}

		set name(name) {
			this._name = name;
		}

		get params() {
			return this._params;
		}

		set params(params) {
			this._params = params;
		}

		get type() {
			return this._type;
		}

		set type(type) {
			this._type = type;
		}

		get valueArrayParams() {
			return this._valueArrayParams;
		}

		set valueArrayParams(valueArrayParams) {
			this._valueArrayParams = valueArrayParams;
		}

		get valueObjectParams() {
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

	export class ComputedProperty extends Property {
		private _methodName: any;

		get methodName() {
			return this._methodName;
		}

		set methodName(methodName) {
			this._methodName = methodName;
		}
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
			newParamStr += '\t\t\t\tcomputed: \'' + this.methodName + '\'\n';
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
			if (computed.methodName) {
				computedMethod = new Function();
				computedMethod.methodName = computed.methodName;
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
