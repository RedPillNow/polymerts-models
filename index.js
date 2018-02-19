"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var htmlParser = require("htmlparser2");
var ts = require("typescript");
var RedPill;
(function (RedPill) {
    var ProgramPart = (function () {
        function ProgramPart() {
        }
        Object.defineProperty(ProgramPart.prototype, "comment", {
            get: function () {
                if (this._comment === undefined && this.tsNode) {
                    var tsNodeAny = this.tsNode;
                    if (tsNodeAny.jsDoc && tsNodeAny.jsDoc.length > 0) {
                        var comm = new Comment();
                        comm.commentText = tsNodeAny.jsDoc[0].comment;
                        if (tsNodeAny.jsDoc[0].tags && tsNodeAny.jsDoc[0].tags.length > 0) {
                            var tags = [];
                            for (var i = 0; i < tsNodeAny.jsDoc[0].tags.length; i++) {
                                var tag = tsNodeAny.jsDoc[0].tags[i];
                                var tagName = '@' + tag.tagName.text;
                                var tagNameType = tag.typeExpression ? tag.typeExpression.getText() : tag.comment;
                                var tagTextName = tag.name ? tag.name.getText() : '';
                                var tagComment = tag.comment ? tag.comment : '';
                                tagName += ' ' + tagNameType;
                                tagName += ' ' + tagTextName;
                                if (tag.comment !== tagNameType) {
                                    tagName += ' ' + tagComment;
                                }
                                tags.push(tagName);
                            }
                            comm.tags = tags;
                        }
                        this._comment = comm;
                    }
                }
                return this._comment;
            },
            set: function (comment) {
                this._comment = comment;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgramPart.prototype, "endLineNum", {
            get: function () {
                if (!this._endLineNum && this.tsNode) {
                    this._endLineNum = getEndLineNumber(this.tsNode);
                }
                return this._endLineNum;
            },
            set: function (endLineNum) {
                this._endLineNum = endLineNum;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgramPart.prototype, "filePath", {
            get: function () {
                if (!this._filePath && this.tsNode) {
                    this._filePath = this.tsNode.getSourceFile().fileName;
                }
                return this._filePath;
            },
            set: function (filePath) {
                this._filePath = filePath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgramPart.prototype, "startLineNum", {
            get: function () {
                if ((!this._startLineNum || this._startLineNum === 0) && this.tsNode) {
                    this._startLineNum = getStartLineNumber(this.tsNode);
                }
                return this._startLineNum;
            },
            set: function (startLineNum) {
                this._startLineNum = startLineNum;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgramPart.prototype, "tsNode", {
            get: function () {
                return this._tsNode;
            },
            set: function (tsNode) {
                this._tsNode = tsNode;
            },
            enumerable: true,
            configurable: true
        });
        ProgramPart.prototype.parseChildren = function (returnType, hasDecorators) {
            var kidsOfType = [];
            var parseKids = function (node) {
                switch (node.kind) {
                    case returnType:
                        if (hasDecorators && node.decorators && node.decorators.length > 0) {
                            kidsOfType.push(node);
                        }
                        else if (!hasDecorators) {
                            kidsOfType.push(node);
                        }
                        break;
                }
                ;
                ts.forEachChild(node, parseKids);
            };
            parseKids(this.tsNode);
            return kidsOfType;
        };
        return ProgramPart;
    }());
    RedPill.ProgramPart = ProgramPart;
    var IncludedBehavior = (function (_super) {
        __extends(IncludedBehavior, _super);
        function IncludedBehavior() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(IncludedBehavior.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (name) {
                this._name = name;
            },
            enumerable: true,
            configurable: true
        });
        IncludedBehavior.prototype.toDocOnlyMarkup = function () {
            var comment = this.comment ? '\n' + this.comment.toDocOnlyMarkup() : '';
            var behaviorStr = comment;
            behaviorStr += this.name;
            return behaviorStr;
        };
        return IncludedBehavior;
    }(ProgramPart));
    RedPill.IncludedBehavior = IncludedBehavior;
    var Component = (function (_super) {
        __extends(Component, _super);
        function Component(node) {
            var _this = _super.call(this) || this;
            _this.tsNode = node;
            return _this;
        }
        Object.defineProperty(Component.prototype, "behaviors", {
            get: function () {
                if ((!this._behaviors || this._behaviors.length === 0) && this.tsNode) {
                    var behaviors_1 = [];
                    this.tsNode.decorators.forEach(function (decorator) {
                        var exp = decorator.expression;
                        var expText = exp.getText();
                        var behaviorMatch = /\s*(?:behavior)\s*\((...*)\)/.exec(exp.getText());
                        if (behaviorMatch && behaviorMatch.length > 0) {
                            var behave = new IncludedBehavior();
                            behave.tsNode = decorator;
                            behave.name = behaviorMatch[1];
                            behaviors_1.push(behave);
                        }
                    });
                    this._behaviors = behaviors_1;
                }
                return this._behaviors || [];
            },
            set: function (behaviors) {
                this._behaviors = behaviors;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "className", {
            get: function () {
                if (!this._className && this.tsNode) {
                    var clazz = this.tsNode;
                    this._className = clazz.name.getText();
                }
                return this._className;
            },
            set: function (className) {
                this._className = className;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "computedProperties", {
            get: function () {
                if (!this._computedProperties && this.tsNode) {
                    var computedDeclarations = this.parseChildren(ts.SyntaxKind.MethodDeclaration, true);
                    var computedProps = [];
                    for (var i = 0; i < computedDeclarations.length; i++) {
                        var computedPropNode = computedDeclarations[i];
                        if (isComputedProperty(computedPropNode)) {
                            var computedProperty = new ComputedProperty(computedPropNode);
                            computedProps.push(computedProperty);
                        }
                    }
                    this._computedProperties = computedProps;
                }
                return this._computedProperties || [];
            },
            set: function (computedProperties) {
                this._computedProperties = computedProperties;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "cssFilePath", {
            get: function () {
                if (!this._cssFilePath && this.filePath) {
                    var baseFilePath = path.basename(this.filePath, '.ts');
                    var dirName = path.dirname(this.filePath);
                    this._cssFilePath = path.join(dirName, baseFilePath + '.css');
                }
                return this._cssFilePath;
            },
            set: function (cssFilePath) {
                this._cssFilePath = cssFilePath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "extendsClass", {
            get: function () {
                return this._extendsClass;
            },
            set: function (extendsClass) {
                this._extendsClass = extendsClass;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "htmlFilePath", {
            get: function () {
                if (!this._htmlFilePath && this.filePath) {
                    var baseFileName = path.basename(this.filePath, '.ts');
                    var dirName = path.dirname(this.filePath);
                    this._htmlFilePath = path.join(dirName, baseFileName + '.html');
                }
                return this._htmlFilePath;
            },
            set: function (htmlFilePath) {
                this._htmlFilePath = htmlFilePath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "listeners", {
            get: function () {
                if (!this._listeners && this.tsNode) {
                    var listenerDeclarations = this.parseChildren(ts.SyntaxKind.MethodDeclaration, true);
                    var listeners = [];
                    for (var i = 0; i < listenerDeclarations.length; i++) {
                        var listenerNode = listenerDeclarations[i];
                        if (isListener(listenerNode)) {
                            var listener = new Listener(listenerNode);
                            listeners.push(listener);
                        }
                    }
                    this._listeners = listeners;
                }
                return this._listeners || [];
            },
            set: function (listeners) {
                this._listeners = listeners;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "methods", {
            get: function () {
                if (!this._methods && this.tsNode) {
                    var methodDeclarations = this.parseChildren(ts.SyntaxKind.MethodDeclaration, false);
                    var methods = [];
                    for (var i = 0; i < methodDeclarations.length; i++) {
                        var methodNode = methodDeclarations[i];
                        if (!isObserver(methodNode) && !isListener(methodNode) && !isComputedProperty(methodNode)) {
                            var func = new Function(methodNode);
                            methods.push(func);
                        }
                    }
                    this._methods = methods;
                }
                return this._methods || [];
            },
            set: function (methods) {
                this._methods = methods;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "name", {
            get: function () {
                var _this = this;
                if (!this._name && this.tsNode) {
                    this.tsNode.decorators.forEach(function (decorator) {
                        var exp = decorator.expression;
                        var expText = exp.getText();
                        var componentMatch = /\s*(?:component)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(exp.getText());
                        if (componentMatch && componentMatch.length > 0) {
                            _this._name = componentMatch[1];
                        }
                    });
                }
                return this._name;
            },
            set: function (name) {
                this._name = name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "namespace", {
            get: function () {
                return this._namespace;
            },
            set: function (namespace) {
                this._namespace = namespace;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "observers", {
            get: function () {
                if (!this._observers && this.tsNode) {
                    var obsDeclarations = this.parseChildren(ts.SyntaxKind.MethodDeclaration, true);
                    var obs = [];
                    for (var i = 0; i < obsDeclarations.length; i++) {
                        var obsNode = obsDeclarations[i];
                        if (isObserver(obsNode)) {
                            var observer = new Observer(obsNode);
                            obs.push(observer);
                        }
                    }
                    this._observers = obs;
                }
                return this._observers || [];
            },
            set: function (observers) {
                this._observers = observers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "properties", {
            get: function () {
                if (!this._properties && this.tsNode) {
                    var propDeclarations = this.parseChildren(ts.SyntaxKind.PropertyDeclaration, true);
                    var props = [];
                    for (var i = 0; i < propDeclarations.length; i++) {
                        var propNode = propDeclarations[i];
                        var prop = new Property(propNode);
                        props.push(prop);
                    }
                    this._properties = props;
                }
                return this._properties || [];
            },
            set: function (properties) {
                this._properties = properties;
            },
            enumerable: true,
            configurable: true
        });
        Component.prototype.toDocOnlyMarkup = function () {
            var componentStr = this._writeDocHtmlComment();
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
        };
        Component.prototype._writeDocHtmlComment = function () {
            var comment = null;
            var parser = new htmlParser.Parser({
                oncomment: function (data) {
                    if (data.indexOf('@demo') > -1 || data.indexOf('@hero') > -1) {
                        comment = new HtmlComment();
                        comment.comment = data;
                    }
                }
            }, { decodeEntities: true });
            parser.write(fs.readFileSync(this.htmlFilePath));
            parser.end();
            return comment ? comment.toDocOnlyMarkup() : '';
        };
        Component.prototype._writeDocHead = function () {
            var headStr = '<dom-module id="' + this.name + '">\n';
            headStr += '\t<template>\n';
            headStr += '\t\t<style></style>\n';
            headStr += '\t\t<script>\n';
            headStr += '(function() {\n';
            headStr += '\tPolymer({\n';
            headStr += '\t\tis: \'' + this.name + '\',';
            return headStr;
        };
        Component.prototype._writeDocFoot = function () {
            var footStr = '\n\t});\n';
            footStr += '})();\n';
            footStr += '\t\t</script>\n';
            footStr += '\t</template>\n';
            footStr += '</dom-module>\n';
            return footStr;
        };
        Component.prototype._writeDocProperties = function () {
            var propertiesStr = '\n\t\tproperties: {';
            for (var i = 0; i < this.properties.length; i++) {
                var prop = this.properties[i];
                propertiesStr += prop.toDocOnlyMarkup();
                propertiesStr += (i + 1) < this.properties.length ? ',' : '';
            }
            propertiesStr += '\n\t\t},';
            return propertiesStr;
        };
        Component.prototype._writeDocBehaviors = function () {
            var behaviorsStr = '\n\t\tbehaviors: [\n';
            for (var i = 0; i < this.behaviors.length; i++) {
                var behavior = this.behaviors[i];
                behaviorsStr += '\t\t\t' + behavior.toDocOnlyMarkup();
                behaviorsStr += (i + 1) < this.behaviors.length ? ',\n' : '';
            }
            behaviorsStr += '\n\t\t],';
            return behaviorsStr;
        };
        Component.prototype._writeDocListeners = function () {
            var listenersStr = '\n\t\tlisteners: {\n';
            for (var i = 0; i < this.listeners.length; i++) {
                var listener = this.listeners[i];
                listenersStr += listener.toDocOnlyMarkup();
                listenersStr += (i + 1) < this.listeners.length ? ',\n' : '';
            }
            listenersStr += '\n\t\t},';
            return listenersStr;
        };
        Component.prototype._writeDocMethods = function () {
            var methodsStr = '';
            for (var i = 0; i < this.methods.length; i++) {
                var method = this.methods[i];
                methodsStr += '\n' + method.toDocOnlyMarkup();
                methodsStr += (i + 1) < this.methods.length ? ',' : '';
            }
            return methodsStr;
        };
        Component.prototype._writeDocObservers = function () {
            var observersStr = '\n\t\tobservers: [\n';
            for (var i = 0; i < this.observers.length; i++) {
                var observer = this.observers[i];
                observersStr += observer.toDocOnlyMarkup();
                observersStr += (i + 1) < this.observers.length ? ',\n' : '';
            }
            observersStr += '\n\t\t\],';
            return observersStr;
        };
        return Component;
    }(ProgramPart));
    RedPill.Component = Component;
    var ProgramType;
    (function (ProgramType) {
        ProgramType["Property"] = "PROPERTY";
        ProgramType["Computed"] = "COMPUTED";
        ProgramType["Component"] = "COMPONENT";
        ProgramType["Behavior"] = "BEHAVIOR";
        ProgramType["Listener"] = "LISTENER";
        ProgramType["Observer"] = "OBSERVER";
        ProgramType["Function"] = "FUNCTION";
    })(ProgramType = RedPill.ProgramType || (RedPill.ProgramType = {}));
    var Comment = (function () {
        function Comment() {
        }
        Object.defineProperty(Comment.prototype, "commentObj", {
            get: function () {
                return this._commentObj;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Comment.prototype, "commentText", {
            get: function () {
                if (!this._commentText && this.commentObj) {
                    this._commentText = this.commentObj.content;
                }
                return this._commentText;
            },
            set: function (commentText) {
                this._commentText = commentText;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Comment.prototype, "endLineNum", {
            get: function () {
                return this._endLineNum;
            },
            set: function (endLineNum) {
                this._endLineNum = endLineNum;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Comment.prototype, "isFor", {
            get: function () {
                return this._isFor;
            },
            set: function (isFor) {
                this._isFor = isFor;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Comment.prototype, "startLineNum", {
            get: function () {
                return this._startLineNum;
            },
            set: function (startLineNum) {
                this._startLineNum = startLineNum;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Comment.prototype, "tags", {
            get: function () {
                return this._tags || [];
            },
            set: function (tags) {
                this._tags = tags;
            },
            enumerable: true,
            configurable: true
        });
        Comment.prototype._getIndent = function () {
            var indentation = '\t\t\t';
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
        };
        Comment.prototype.toDocOnlyMarkup = function () {
            var markup = this._getIndent() + '/**\n';
            markup += this._getIndent() + ' * ';
            markup += this.commentText ? this.commentText.replace(/\n/g, '\n' + this._getIndent() + ' * ') + '\n' : '\n';
            for (var i = 0; i < this.tags.length; i++) {
                var tag = this.tags[i];
                markup += this._getIndent() + ' * ' + tag + '\n';
            }
            markup += this._getIndent() + ' */\n';
            if (!this.commentText && (!this.tags || this.tags.length === 0)) {
                markup = '';
            }
            return markup;
        };
        return Comment;
    }());
    RedPill.Comment = Comment;
    var Function = (function (_super) {
        __extends(Function, _super);
        function Function(node) {
            var _this = _super.call(this) || this;
            _this.tsNode = node;
            return _this;
        }
        Object.defineProperty(Function.prototype, "methodName", {
            get: function () {
                if (!this._methodName && this.tsNode) {
                    var methodNode = null;
                    if (this.tsNode.kind === ts.SyntaxKind.MethodDeclaration) {
                        methodNode = this.tsNode;
                    }
                    else if (this.tsNode.kind === ts.SyntaxKind.ArrowFunction) {
                        methodNode = this.tsNode;
                    }
                    this._methodName = methodNode && methodNode.name ? methodNode.name.getText() : null;
                }
                return this._methodName;
            },
            set: function (methodName) {
                this._methodName = methodName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Function.prototype, "parameters", {
            get: function () {
                if (!this._parameters && this.tsNode) {
                    var params = [];
                    var methodNode = this.tsNode;
                    var paramNodes = this.parseChildren(ts.SyntaxKind.Parameter, false);
                    for (var i = 0; i < paramNodes.length; i++) {
                        var paramNode = paramNodes[i];
                        if (paramNode.parent === this.tsNode) {
                            params.push(paramNode.getText().replace(/\??:\s*[a-zA-Z]*/g, ''));
                        }
                    }
                    this._parameters = params;
                }
                return this._parameters || [];
            },
            set: function (parameters) {
                this._parameters = parameters || [];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Function.prototype, "returnType", {
            get: function () {
                return this._returnType;
            },
            set: function (returnType) {
                this._returnType = returnType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Function.prototype, "signature", {
            get: function () {
                if (!this._signature && this.methodName && this.parameters) {
                    this._signature = this.methodName + '(';
                    for (var i = 0; i < this.parameters.length; i++) {
                        this._signature += this.parameters[i];
                        this._signature += (i + 1) < this.parameters.length ? ', ' : '';
                    }
                    this._signature += ') {}';
                }
                return this._signature;
            },
            set: function (signature) {
                this._signature = signature;
            },
            enumerable: true,
            configurable: true
        });
        Function.prototype.toDocOnlyMarkup = function () {
            var comment = this.comment ? this.comment.toDocOnlyMarkup() : '';
            var functionStr = comment;
            functionStr += '\t\t' + this.signature;
            return functionStr;
        };
        return Function;
    }(ProgramPart));
    RedPill.Function = Function;
    var HtmlComment = (function () {
        function HtmlComment() {
        }
        Object.defineProperty(HtmlComment.prototype, "comment", {
            get: function () {
                return this._comment;
            },
            set: function (comment) {
                this._comment = comment;
            },
            enumerable: true,
            configurable: true
        });
        HtmlComment.prototype.toDocOnlyMarkup = function () {
            var commentStr = null;
            if (this.comment) {
                commentStr = '<!--\n';
                commentStr += this.comment;
                commentStr += '\n-->\n';
            }
            return commentStr;
        };
        return HtmlComment;
    }());
    RedPill.HtmlComment = HtmlComment;
    var Listener = (function (_super) {
        __extends(Listener, _super);
        function Listener(node) {
            var _this = _super.call(this) || this;
            _this._isExpression = false;
            _this.tsNode = node;
            return _this;
        }
        Object.defineProperty(Listener.prototype, "elementId", {
            get: function () {
                if (!this._elementId && !this.isExpression && this.tsNode) {
                    var sigArr = this.eventDeclaration ? this.eventDeclaration.split('.') : [];
                    this._elementId = this.eventName ? sigArr[0] : null;
                }
                return this._elementId;
            },
            set: function (elementId) {
                this._elementId = elementId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Listener.prototype, "eventDeclaration", {
            get: function () {
                var _this = this;
                if (!this._eventDeclaration && this.tsNode) {
                    if (this.tsNode.decorators && this.tsNode.decorators.length > 0) {
                        this.tsNode.decorators.forEach(function (decorator, idx) {
                            var parseChildren = function (decoratorChildNode) {
                                var kindStr = ts.SyntaxKind[decoratorChildNode.kind] + '=' + decoratorChildNode.kind;
                                switch (decoratorChildNode.kind) {
                                    case ts.SyntaxKind.StringLiteral:
                                        var listenerStrNode = decoratorChildNode;
                                        _this._eventDeclaration = listenerStrNode.getText();
                                        break;
                                    case ts.SyntaxKind.PropertyAccessExpression:
                                        var listenerPropAccExp = decoratorChildNode;
                                        _this._eventDeclaration = listenerPropAccExp.getText();
                                        break;
                                }
                                ;
                                ts.forEachChild(decoratorChildNode, parseChildren);
                            };
                            parseChildren(decorator);
                        });
                    }
                }
                return this._eventDeclaration;
            },
            set: function (eventDeclaration) {
                this._eventDeclaration = eventDeclaration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Listener.prototype, "eventName", {
            get: function () {
                if (!this._eventName && this.tsNode) {
                    var sigArr = this.eventDeclaration ? this.eventDeclaration.split('.') : [];
                    this._eventName = sigArr[1] || null;
                }
                return this._eventName;
            },
            set: function (name) {
                this._eventName = name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Listener.prototype, "isExpression", {
            get: function () {
                var _this = this;
                if (!this._isExpression && this.tsNode) {
                    if (this.tsNode.decorators && this.tsNode.decorators.length > 0) {
                        this.tsNode.decorators.forEach(function (decorator, idx) {
                            var parseChildren = function (decoratorChildNode) {
                                switch (decoratorChildNode.kind) {
                                    case ts.SyntaxKind.PropertyAccessExpression:
                                        _this._isExpression = true;
                                        break;
                                }
                                ;
                                ts.forEachChild(decoratorChildNode, parseChildren);
                            };
                            parseChildren(decorator);
                        });
                    }
                }
                return this._isExpression;
            },
            set: function (isExpression) {
                this._isExpression = isExpression;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Listener.prototype, "methodName", {
            get: function () {
                if (!this._methodName && this.tsNode) {
                    var methodNode = this.tsNode;
                    this._methodName = methodNode.name.getText();
                }
                return this._methodName;
            },
            set: function (methodName) {
                this._methodName = methodName;
            },
            enumerable: true,
            configurable: true
        });
        Listener.prototype.toDocOnlyMarkup = function () {
            var comment = this.comment ? this.comment.toDocOnlyMarkup() : '';
            var listenerStr = comment;
            var eventName = this.eventDeclaration ? this.eventDeclaration.replace(/['"]/g, '') : '';
            listenerStr += '\t\t\t\'' + eventName + '\'';
            listenerStr += ': ';
            listenerStr += '\'' + this.methodName + '\'';
            return listenerStr;
        };
        return Listener;
    }(ProgramPart));
    RedPill.Listener = Listener;
    var Observer = (function (_super) {
        __extends(Observer, _super);
        function Observer(node) {
            var _this = _super.call(this) || this;
            _this._isComplex = false;
            _this.tsNode = node;
            return _this;
        }
        Object.defineProperty(Observer.prototype, "isComplex", {
            get: function () {
                var _this = this;
                if (!this._isComplex && this.tsNode) {
                    if (this.properties && this.properties.length > 0) {
                        this.properties.forEach(function (prop) {
                            if (prop.indexOf('.') > -1) {
                                _this._isComplex = true;
                            }
                        });
                        if (!this._isComplex && this.properties.length > 1) {
                            this._isComplex = true;
                        }
                    }
                }
                return this._isComplex;
            },
            set: function (isComplex) {
                this._isComplex = isComplex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Observer.prototype, "methodName", {
            get: function () {
                if (!this._methodName && this.tsNode) {
                    var methodNode = this.tsNode;
                    this._methodName = methodNode.name.getText();
                }
                return this._methodName;
            },
            set: function (methodName) {
                this._methodName = methodName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Observer.prototype, "properties", {
            get: function () {
                if (!this._properties && this.tsNode) {
                    var props_1 = [];
                    if (this.tsNode.decorators && this.tsNode.decorators.length > 0) {
                        this.tsNode.decorators.forEach(function (decorator) {
                            var parseChildren = function (decoratorChildNode) {
                                if (decoratorChildNode.kind === ts.SyntaxKind.StringLiteral) {
                                    var observerStrNode = decoratorChildNode;
                                    var propsStr = observerStrNode.getText();
                                    propsStr = propsStr.replace(/[\s']*/g, '');
                                    if (propsStr.indexOf(',') > -1) {
                                        props_1 = props_1.concat(propsStr.split(','));
                                    }
                                    else {
                                        props_1.push(propsStr);
                                    }
                                }
                                ts.forEachChild(decoratorChildNode, parseChildren);
                            };
                            parseChildren(decorator);
                        });
                    }
                    this._properties = props_1;
                }
                return this._properties;
            },
            set: function (properties) {
                this._properties = properties;
            },
            enumerable: true,
            configurable: true
        });
        Observer.prototype.toDocOnlyMarkup = function () {
            var comment = this.comment ? this.comment.toDocOnlyMarkup() : '';
            var observerStr = comment;
            observerStr += '\t\t\t\'' + this.methodName + '(';
            for (var i = 0; i < this.properties.length; i++) {
                var prop = this.properties[i];
                observerStr += prop;
                observerStr += (i + 1) < this.properties.length ? ',' : '';
            }
            observerStr += ')\'';
            return observerStr;
        };
        return Observer;
    }(ProgramPart));
    RedPill.Observer = Observer;
    var Property = (function (_super) {
        __extends(Property, _super);
        function Property(node) {
            var _this = _super.call(this) || this;
            _this._containsValueArrayLiteral = false;
            _this._containsValueFunction = false;
            _this._containsValueObjectDeclaration = false;
            _this.tsNode = node;
            return _this;
        }
        Object.defineProperty(Property.prototype, "derivedComment", {
            get: function () {
                if (!this.comment || !this.comment.commentText) {
                    this.comment = this.comment ? this.comment : new Comment();
                    var type = this.type || 'Object';
                    this.comment.tags = ['@type {' + type + '}'];
                    this.comment.isFor = ProgramType.Property;
                }
                return this.comment;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "containsValueArrayLiteral", {
            get: function () {
                var _this = this;
                if (!this._containsValueArrayLiteral && this.tsNode) {
                    var parseChildren_1 = function (childNode) {
                        if (childNode.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                            var arrayLiteral = childNode;
                            _this._containsValueArrayLiteral = true;
                        }
                        ts.forEachChild(childNode, parseChildren_1);
                    };
                    parseChildren_1(this.tsNode);
                }
                return this._containsValueArrayLiteral;
            },
            set: function (containsValueArrayLiteral) {
                this._containsValueArrayLiteral = containsValueArrayLiteral;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "containsValueFunction", {
            get: function () {
                var _this = this;
                if (!this._containsValueFunction && this.tsNode) {
                    var parseChildren_2 = function (childNode) {
                        if (childNode.kind === ts.SyntaxKind.ArrowFunction) {
                            _this._containsValueFunction = true;
                        }
                        else if (childNode.kind === ts.SyntaxKind.MethodDeclaration) {
                            _this._containsValueFunction = true;
                        }
                        ts.forEachChild(childNode, parseChildren_2);
                    };
                    parseChildren_2(this.tsNode);
                }
                return this._containsValueFunction;
            },
            set: function (containsValueFunction) {
                this._containsValueFunction = containsValueFunction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "containsValueObjectDeclaration", {
            get: function () {
                var _this = this;
                if (!this._containsValueObjectDeclaration && this.tsNode) {
                    var insideProperty_1 = false;
                    var parseChildren_3 = function (childNode) {
                        if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                            if (!insideProperty_1) {
                                insideProperty_1 = true;
                            }
                            else {
                                _this._containsValueObjectDeclaration = true;
                            }
                        }
                        ts.forEachChild(childNode, parseChildren_3);
                    };
                    parseChildren_3(this.tsNode);
                }
                return this._containsValueObjectDeclaration;
            },
            set: function (containsValueObjectDeclaration) {
                this._containsValueObjectDeclaration = containsValueObjectDeclaration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "name", {
            get: function () {
                if (!this._name && this.tsNode) {
                    var propNode = this.tsNode;
                    this._name = propNode.name.getText();
                }
                return this._name;
            },
            set: function (name) {
                this._name = name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "params", {
            get: function () {
                var _this = this;
                if (!this._params && this.tsNode) {
                    var insideProperty_2 = false;
                    var parseChildren_4 = function (childNode) {
                        console.log('Property.params.parseChildren, childNode kind=', ts.SyntaxKind[childNode.kind]);
                        console.log('Property.params.parseChildren, parentNode kind=', ts.SyntaxKind[childNode.parent.kind]);
                        if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                            var objExp = childNode;
                            if (!insideProperty_2) {
                                var objLiteralObj = getObjectLiteralString(objExp);
                                _this._params = objLiteralObj.str;
                                insideProperty_2 = true;
                            }
                        }
                        ts.forEachChild(childNode, parseChildren_4);
                    };
                    parseChildren_4(this.tsNode);
                }
                return this._params;
            },
            set: function (params) {
                this._params = params;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "type", {
            get: function () {
                var _this = this;
                if (!this._type && this.tsNode) {
                    var insideProperty_3 = false;
                    var parseChildren_5 = function (childNode) {
                        if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                            var objExp = childNode;
                            if (!insideProperty_3) {
                                var objLiteralObj = RedPill.getObjectLiteralString(objExp);
                                _this._type = objLiteralObj.type;
                                insideProperty_3 = true;
                            }
                        }
                        ts.forEachChild(childNode, parseChildren_5);
                    };
                    parseChildren_5(this.tsNode);
                }
                return this._type;
            },
            set: function (type) {
                this._type = type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "valueArrayParams", {
            get: function () {
                var _this = this;
                if (!this._valueArrayParams && this.tsNode) {
                    var parseChildren_6 = function (childNode) {
                        if (childNode.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                            var arrayLiteral = childNode;
                            _this._valueArrayParams = arrayLiteral.getText();
                        }
                        ts.forEachChild(childNode, parseChildren_6);
                    };
                    parseChildren_6(this.tsNode);
                }
                return this._valueArrayParams;
            },
            set: function (valueArrayParams) {
                this._valueArrayParams = valueArrayParams;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "valueFunction", {
            get: function () {
                var _this = this;
                if (!this._valueFunction && this.tsNode) {
                    var parseChildren_7 = function (childNode) {
                        var childKind = childNode.kind;
                        if (childKind === ts.SyntaxKind.MethodDeclaration || childKind === ts.SyntaxKind.ArrowFunction) {
                            _this._valueFunction = new Function(childNode);
                        }
                        ts.forEachChild(childNode, parseChildren_7);
                    };
                    parseChildren_7(this.tsNode);
                }
                return this._valueFunction;
            },
            set: function (valueFunction) {
                this._valueFunction = valueFunction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Property.prototype, "valueObjectParams", {
            get: function () {
                var _this = this;
                if (!this._valueObjectParams && this.tsNode) {
                    var insideProperty_4 = false;
                    var parseChildren_8 = function (childNode) {
                        if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                            var objExp = childNode;
                            if (!insideProperty_4) {
                                insideProperty_4 = true;
                            }
                            else {
                                _this._valueObjectParams = RedPill.getObjectLiteralString(objExp).str;
                            }
                        }
                        ts.forEachChild(childNode, parseChildren_8);
                    };
                    parseChildren_8(this.tsNode);
                }
                return this._valueObjectParams;
            },
            set: function (valueParams) {
                this._valueObjectParams = valueParams;
            },
            enumerable: true,
            configurable: true
        });
        Property.prototype._parseParams = function () {
            var partsArr = this.params ? this.params.split(',') : [];
            var newParamStr = '{\n';
            for (var i = 0; i < partsArr.length; i++) {
                var part = partsArr[i];
                if (this.containsValueFunction && part.indexOf('value:') > -1) {
                    newParamStr += this._parseValueFunction(part);
                    newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
                }
                else if (this.containsValueObjectDeclaration && part.indexOf('value:') > -1) {
                    newParamStr += '\t\t\t\t' + this._parseValueObject();
                    var valueLen = this.valueObjectParams ? this.valueObjectParams.split(',').length - 1 : 0;
                    newParamStr += (i + 1) < (partsArr.length - valueLen) ? ',\n' : '\n';
                }
                else if (this.containsValueArrayLiteral && part.indexOf('value:') > -1) {
                    newParamStr += '\t\t\t\t' + this._parseValueArray();
                    var valueLen = this.valueArrayParams ? this.valueArrayParams.split(',').length - 1 : 0;
                    newParamStr += (i + 1) < (partsArr.length - valueLen) ? ',\n' : '\n';
                }
                else {
                    var regEx = /[/{/}\n\t]/g;
                    if (part.indexOf('type') > -1) {
                        regEx = /[/{/}\n\t']/g;
                    }
                    if ((this.containsValueObjectDeclaration || this.containsValueArrayLiteral) && !this._isPartOfValue(part)) {
                        newParamStr += '\t\t\t\t' + part.replace(regEx, '');
                        newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
                    }
                    else if (!this.containsValueObjectDeclaration && !this.containsValueArrayLiteral) {
                        newParamStr += '\t\t\t\t' + part.replace(regEx, '');
                        newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
                    }
                }
            }
            newParamStr += '\t\t\t}';
            return newParamStr;
        };
        Property.prototype._isPartOfValue = function (part) {
            var partOfValue = false;
            if (part && this.containsValueObjectDeclaration) {
                var valueObj = getObjectFromString(this.valueObjectParams);
                var partMatch = /(?:^[\{\s"]*([a-zA-Z0-9]+):(?:.)*)/.exec(part);
                if (partMatch) {
                    var key = partMatch[1];
                    partOfValue = valueObj.hasOwnProperty(key);
                }
            }
            else if (part && this.containsValueArrayLiteral) {
                var valueArr = getArrayFromString(this.valueArrayParams);
                var partMatch = /(?:['"\s]*([a-zA-Z]*)['"\s]*)/.exec(part);
                if (partMatch && partMatch[1]) {
                    var key = partMatch[1];
                    partOfValue = valueArr.indexOf(key) > -1;
                }
            }
            return partOfValue;
        };
        Property.prototype._parseValueArray = function () {
            var valueArrStr = 'value: [';
            var arrayParts = this.valueArrayParams.split(',');
            for (var i = 1; i < arrayParts.length; i++) {
                var part = arrayParts[i];
                if (i === 1) {
                    valueArrStr += '\n';
                }
                valueArrStr += '\t' + part.replace(/[\]\[\n]/g, '');
                valueArrStr += (i + 1) < arrayParts.length ? ',\n' : '\n';
            }
            if (arrayParts.length > 1) {
                valueArrStr += '\t\t\t\t]';
            }
            else {
                valueArrStr += ']';
            }
            return valueArrStr;
        };
        Property.prototype._parseValueObject = function () {
            var objStr = 'value: {';
            var partsArr = this.valueObjectParams ? this.valueObjectParams.split(',') : [];
            for (var i = 0; i < partsArr.length; i++) {
                var part = partsArr[i];
                if (i === 0) {
                    objStr += '\n';
                }
                objStr += '\t\t\t\t\t' + part.replace(/[/{/}\n\t]/g, '');
                objStr += (i + 1) < partsArr.length ? ',\n' : '\n';
            }
            if (partsArr.length > 1) {
                objStr += '\t\t\t\t}';
            }
            else {
                objStr += '}';
            }
            return objStr;
        };
        Property.prototype._parseValueFunction = function (valueFunctionPart) {
            var funcStr = '';
            if (valueFunctionPart) {
                var funcArr_1 = valueFunctionPart.split('\n');
                var idx_1 = 0;
                funcArr_1.forEach(function (element) {
                    if ((idx_1 === 0 && element) || (idx_1 === 1 && element)) {
                        funcStr += '\t\t\t' + element.replace(/\n\t/g, '') + '\n';
                    }
                    else if (idx_1 === funcArr_1.length - 1) {
                        funcStr += '\t' + element.replace(/\n\t/g, '');
                    }
                    else if (element) {
                        funcStr += '\t' + element.replace(/\n\t/g, '') + '\n';
                    }
                    idx_1++;
                });
            }
            return funcStr;
        };
        Property.prototype.toDocOnlyMarkup = function () {
            var nameParts = this.name.split(':');
            var comment = this.comment && this.comment.commentText ? '\n' + this.comment.toDocOnlyMarkup() : '\n' + this.derivedComment.toDocOnlyMarkup();
            var propStr = comment;
            propStr += '\t\t\t' + nameParts[0];
            propStr += ': ';
            propStr += this._parseParams();
            return propStr;
        };
        return Property;
    }(ProgramPart));
    RedPill.Property = Property;
    var ComputedProperty = (function (_super) {
        __extends(ComputedProperty, _super);
        function ComputedProperty() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ComputedProperty.prototype, "derivedMethodName", {
            get: function () {
                if (!this._derivedMethodName && this.tsNode) {
                    var methodNode = this.tsNode;
                    this._derivedMethodName = '_get' + capitalizeFirstLetter(methodNode.name.getText().replace(/_/g, ''));
                }
                return this._derivedMethodName;
            },
            set: function (methodName) {
                this._derivedMethodName = methodName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComputedProperty.prototype, "methodName", {
            get: function () {
                if (!this._methodName && this.tsNode) {
                    var methodNode = this.tsNode;
                    this._methodName = methodNode.name.getText();
                }
                return this._methodName;
            },
            set: function (methodName) {
                this._methodName = methodName;
            },
            enumerable: true,
            configurable: true
        });
        ComputedProperty.prototype._getNewParams = function () {
            var partsArr = this.params ? this.params.split(',') : [];
            var hasType = partsArr.find(function (part) {
                return part.indexOf('type:') > -1;
            });
            if (!hasType) {
                partsArr.unshift('type: Object');
            }
            var newParamStr = '{\n';
            for (var i = 0; i < partsArr.length; i++) {
                var part = partsArr[i];
                newParamStr += '\t\t\t\t' + part.replace(/[/{/}\n\t]/g, '');
                newParamStr += ',\n';
            }
            newParamStr += '\t\t\t\tcomputed: \'' + this.derivedMethodName + '\'\n';
            newParamStr += '\t\t\t}';
            return newParamStr;
        };
        ComputedProperty.prototype.toDocOnlyMarkup = function () {
            var nameParts = this.name.split(':');
            var comment = this.comment && this.comment.commentText ? '\n' + this.comment.toDocOnlyMarkup() : '\n' + this.derivedComment.toDocOnlyMarkup();
            var propStr = comment;
            propStr += '\t\t\t' + nameParts[0];
            propStr += ': ';
            propStr += this._getNewParams();
            return propStr;
        };
        return ComputedProperty;
    }(Property));
    RedPill.ComputedProperty = ComputedProperty;
    var PathInfo = (function () {
        function PathInfo() {
        }
        return PathInfo;
    }());
    RedPill.PathInfo = PathInfo;
    function trimRight(str) {
        return str.replace(/\s+$/, '');
    }
    RedPill.trimRight = trimRight;
    function trimTabs(str) {
        return str.replace(/\t+/g, '');
    }
    RedPill.trimTabs = trimTabs;
    function trimAllWhitespace(str) {
        return str.replace(/\s*/g, '');
    }
    RedPill.trimAllWhitespace = trimAllWhitespace;
    function getObjectLiteralString(objExp) {
        var objLiteralObj = {};
        if (objExp && objExp.properties && objExp.properties.length > 0) {
            var paramStr = '{\n';
            for (var i = 0; i < objExp.properties.length; i++) {
                var propProperty = objExp.properties[i];
                var propPropertyKey = propProperty.name.getText();
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
    RedPill.getObjectLiteralString = getObjectLiteralString;
    function getStringFromObject(obj) {
        var objStr = null;
        if (obj) {
            var objLength = Object.keys(obj).length;
            objStr = '{\n';
            var idx = 0;
            for (var key in obj) {
                var objVal = '\'' + obj[key] + '\'';
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
    RedPill.getStringFromObject = getStringFromObject;
    function getObjectFromString(objectStr) {
        var params = {};
        var partsArr = objectStr ? objectStr.split(',') : [];
        for (var i = 0; i < partsArr.length; i++) {
            var part = partsArr[i];
            var partStr = part.replace(/[/{/}\n\t]/g, '');
            partStr = trimAllWhitespace(partStr);
            var partArr = partStr.split(':');
            partArr[1] = partArr[1] === 'true' ? true : partArr[1];
            partArr[1] = partArr[1] === 'false' ? false : partArr[1];
            params[partArr[0]] = partArr[1];
        }
        return params;
    }
    RedPill.getObjectFromString = getObjectFromString;
    function getArrayFromString(arrayStr) {
        var arr = [];
        if (arrayStr) {
            var partsArr = arrayStr.replace(/[\[\]]/g, '').split(',');
            for (var i = 0; i < partsArr.length; i++) {
                var part = partsArr[i];
                if (part) {
                    var partStr = part.replace(/[\n\t\[\]'"]/g, '');
                    partStr = trimAllWhitespace(partStr);
                    arr.push(partStr);
                }
            }
        }
        return arr;
    }
    RedPill.getArrayFromString = getArrayFromString;
    function getPathInfo(fileName, docPath) {
        var pathInfo = new PathInfo;
        if (fileName) {
            var fileNameExt = path.extname(fileName);
            pathInfo.fileName = fileName;
            pathInfo.dirName = docPath;
            pathInfo.docFileName = 'doc_' + path.basename(fileName).replace(fileNameExt, '.html');
            pathInfo.fullDocFilePath = path.join(docPath, pathInfo.docFileName);
            pathInfo.htmlFileName = path.basename(fileName).replace(fileNameExt, '.html');
            pathInfo.fullHtmlFilePath = path.join(path.dirname(fileName), pathInfo.htmlFileName);
        }
        return pathInfo;
    }
    RedPill.getPathInfo = getPathInfo;
    function getStartLineNumber(node) {
        var lineObj = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
        return lineObj.line + 1;
    }
    RedPill.getStartLineNumber = getStartLineNumber;
    function getEndLineNumber(node) {
        var lineObj = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getEnd());
        return lineObj.line + 1;
    }
    RedPill.getEndLineNumber = getEndLineNumber;
    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    RedPill.capitalizeFirstLetter = capitalizeFirstLetter;
    function isNodeComponentChild(parentNode, component) {
        var isComponent = false;
        if (ts.isClassDeclaration(parentNode) && component) {
            var classDecl = parentNode;
            if (classDecl.name.getText() === component.className) {
                isComponent = true;
            }
        }
        return isComponent;
    }
    RedPill.isNodeComponentChild = isNodeComponentChild;
    function getMethodFromListener(listener) {
        var listenerMethod = null;
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
                var tags = listenerMethod.comment.tags || [];
                var hasListensTag = tags.find(function (tag) {
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
    RedPill.getMethodFromListener = getMethodFromListener;
    function getMethodFromComputed(computed) {
        var computedMethod = null;
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
    RedPill.getMethodFromComputed = getMethodFromComputed;
    function getMethodFromObserver(observer) {
        var observerMethod = null;
        if (observer) {
            if (observer.methodName) {
                observerMethod = new Function();
                observerMethod.methodName = observer.methodName;
                if (observer.properties && observer.properties.length > 0) {
                    var paramArr = [];
                    for (var i = 0; i < observer.properties.length; i++) {
                        var prop = observer.properties[i];
                        var propVal = null;
                        if (prop.indexOf('.') > -1) {
                            propVal = prop.split('.')[1];
                        }
                        else {
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
    RedPill.getMethodFromObserver = getMethodFromObserver;
    function isComputedProperty(node) {
        var isComputed = false;
        if (node && node.decorators && node.decorators.length > 0) {
            node.decorators.forEach(function (val, idx) {
                var exp = val.expression;
                var expText = exp.getText();
                var decoratorMatch = /\s*(?:computed)\s*\((?:\{*(.*)\}*)\)/.exec(expText);
                isComputed = decoratorMatch && decoratorMatch.length > 0 ? true : false;
            });
        }
        return isComputed;
    }
    RedPill.isComputedProperty = isComputedProperty;
    function isListener(node) {
        var isListener = false;
        if (node && node.decorators && node.decorators.length > 0) {
            node.decorators.forEach(function (val, idx) {
                var exp = val.expression;
                var expText = exp.getText();
                var decoratorMatch = /\s*(?:listen)\s*\((?:\{*(.*)\}*)\)/.exec(expText);
                isListener = decoratorMatch && decoratorMatch.length > 0 ? true : false;
            });
        }
        return isListener;
    }
    RedPill.isListener = isListener;
    function isObserver(node) {
        var isObserver = false;
        if (node && node.decorators && node.decorators.length > 0) {
            node.decorators.forEach(function (val, idx) {
                var exp = val.expression;
                var expText = exp.getText();
                var decoratorMatch = /\s*(?:observe)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(expText);
                isObserver = decoratorMatch && decoratorMatch.length > 0 ? true : false;
            });
        }
        return isObserver;
    }
    RedPill.isObserver = isObserver;
})(RedPill = exports.RedPill || (exports.RedPill = {}));
exports.default = { RedPill: RedPill };
//# sourceMappingURL=index.js.map