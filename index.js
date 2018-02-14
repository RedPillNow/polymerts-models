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
var htmlParser = require("htmlparser2");
var fs = require("fs");
var Utils = require("./lib/utils");
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
            return this._endLineNum;
        },
        set: function (endLineNum) {
            this._endLineNum = endLineNum;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgramPart.prototype, "startLineNum", {
        get: function () {
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
    return ProgramPart;
}());
exports.ProgramPart = ProgramPart;
var Behavior = (function (_super) {
    __extends(Behavior, _super);
    function Behavior() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Behavior.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Behavior.prototype.toMarkup = function () {
        var comment = this.comment ? '\n' + this.comment.toMarkup() : '';
        var behaviorStr = comment;
        behaviorStr += this.name;
        return behaviorStr;
    };
    return Behavior;
}(ProgramPart));
exports.Behavior = Behavior;
var Component = (function (_super) {
    __extends(Component, _super);
    function Component() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Component.prototype, "behaviors", {
        get: function () {
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
            return this._className;
        },
        set: function (className) {
            this._className = className;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "htmlFilePath", {
        get: function () {
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
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "observers", {
        get: function () {
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
            return this._properties || [];
        },
        set: function (properties) {
            this._properties = properties;
        },
        enumerable: true,
        configurable: true
    });
    Component.prototype.toMarkup = function () {
        var componentStr = this._writeHtmlComment();
        componentStr += this._writeHead();
        if (this.behaviors && this.behaviors.length > 0) {
            componentStr += this._writeBehaviors();
        }
        if (this.properties && this.properties.length > 0) {
            componentStr += this._writeProperties();
        }
        if (this.observers && this.observers.length > 0) {
            componentStr += this._writeObservers();
        }
        if (this.listeners && this.listeners.length > 0) {
            componentStr += this._writeListeners();
        }
        if (this.observers && this.observers.length > 0) {
        }
        if (this.methods && this.methods.length > 0) {
            componentStr += this._writeMethods();
        }
        componentStr += this._writeFoot();
        return componentStr;
    };
    Component.prototype._writeHtmlComment = function () {
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
        return comment ? comment.toMarkup() : '';
    };
    Component.prototype._writeHead = function () {
        var headStr = '<dom-module id="' + this.name + '">\n';
        headStr += '\t<template>\n';
        headStr += '\t\t<style></style>\n';
        headStr += '\t\t<script>\n';
        headStr += '(function() {\n';
        headStr += '\tPolymer({\n';
        headStr += '\t\tis: \'' + this.name + '\',';
        return headStr;
    };
    Component.prototype._writeFoot = function () {
        var footStr = '\n\t});\n';
        footStr += '})();\n';
        footStr += '\t\t</script>\n';
        footStr += '\t</template>\n';
        footStr += '</dom-module>\n';
        return footStr;
    };
    Component.prototype._writeProperties = function () {
        var propertiesStr = '\n\t\tproperties: {';
        for (var i = 0; i < this.properties.length; i++) {
            var prop = this.properties[i];
            propertiesStr += prop.toMarkup();
            propertiesStr += (i + 1) < this.properties.length ? ',' : '';
        }
        propertiesStr += '\n\t\t},';
        return propertiesStr;
    };
    Component.prototype._writeBehaviors = function () {
        var behaviorsStr = '\n\t\tbehaviors: [\n';
        for (var i = 0; i < this.behaviors.length; i++) {
            var behavior = this.behaviors[i];
            behaviorsStr += '\t\t\t' + behavior.toMarkup();
            behaviorsStr += (i + 1) < this.behaviors.length ? ',\n' : '';
        }
        behaviorsStr += '\n\t\t],';
        return behaviorsStr;
    };
    Component.prototype._writeListeners = function () {
        var listenersStr = '\n\t\tlisteners: {\n';
        for (var i = 0; i < this.listeners.length; i++) {
            var listener = this.listeners[i];
            listenersStr += listener.toMarkup();
            listenersStr += (i + 1) < this.listeners.length ? ',\n' : '';
        }
        listenersStr += '\n\t\t},';
        return listenersStr;
    };
    Component.prototype._writeMethods = function () {
        var methodsStr = '';
        for (var i = 0; i < this.methods.length; i++) {
            var method = this.methods[i];
            methodsStr += '\n' + method.toMarkup();
            methodsStr += (i + 1) < this.methods.length ? ',' : '';
        }
        return methodsStr;
    };
    Component.prototype._writeObservers = function () {
        var observersStr = '\n\t\tobservers: [\n';
        for (var i = 0; i < this.observers.length; i++) {
            var observer = this.observers[i];
            observersStr += observer.toMarkup();
            observersStr += (i + 1) < this.observers.length ? ',\n' : '';
        }
        observersStr += '\n\t\t\],';
        return observersStr;
    };
    return Component;
}(ProgramPart));
exports.Component = Component;
var ProgramType;
(function (ProgramType) {
    ProgramType["Property"] = "PROPERTY";
    ProgramType["Computed"] = "COMPUTED";
    ProgramType["Component"] = "COMPONENT";
    ProgramType["Behavior"] = "BEHAVIOR";
    ProgramType["Listener"] = "LISTENER";
    ProgramType["Observer"] = "OBSERVER";
    ProgramType["Function"] = "FUNCTION";
})(ProgramType = exports.ProgramType || (exports.ProgramType = {}));
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
    Comment.prototype.toMarkup = function () {
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
exports.Comment = Comment;
var Function = (function (_super) {
    __extends(Function, _super);
    function Function() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Function.prototype, "methodName", {
        get: function () {
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
    Function.prototype.toMarkup = function () {
        var comment = this.comment ? this.comment.toMarkup() : '';
        var functionStr = comment;
        functionStr += '\t\t' + this.signature;
        return functionStr;
    };
    return Function;
}(ProgramPart));
exports.Function = Function;
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
    HtmlComment.prototype.toMarkup = function () {
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
exports.HtmlComment = HtmlComment;
var Listener = (function (_super) {
    __extends(Listener, _super);
    function Listener() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._isExpression = false;
        return _this;
    }
    Object.defineProperty(Listener.prototype, "elementId", {
        get: function () {
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
            return this._methodName;
        },
        set: function (methodName) {
            this._methodName = methodName;
        },
        enumerable: true,
        configurable: true
    });
    Listener.prototype.toMarkup = function () {
        var comment = this.comment ? this.comment.toMarkup() : '';
        var listenerStr = comment;
        var eventName = this.eventDeclaration ? this.eventDeclaration.replace(/['"]/g, '') : '';
        listenerStr += '\t\t\t\'' + eventName + '\'';
        listenerStr += ': ';
        listenerStr += '\'' + this.methodName + '\'';
        return listenerStr;
    };
    return Listener;
}(ProgramPart));
exports.Listener = Listener;
var Observer = (function (_super) {
    __extends(Observer, _super);
    function Observer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Observer.prototype, "properties", {
        get: function () {
            return this._properties;
        },
        set: function (properties) {
            this._properties = properties;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Observer.prototype, "methodName", {
        get: function () {
            return this._methodName;
        },
        set: function (methodName) {
            this._methodName = methodName;
        },
        enumerable: true,
        configurable: true
    });
    Observer.prototype.toMarkup = function () {
        var comment = this.comment ? this.comment.toMarkup() : '';
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
exports.Observer = Observer;
var Property = (function (_super) {
    __extends(Property, _super);
    function Property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._containsValueArrayLiteral = false;
        _this._containsValueFunction = false;
        _this._containsValueObjectDeclaration = false;
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
            return this._valueArrayParams;
        },
        set: function (valueArrayParams) {
            this._valueArrayParams = valueArrayParams;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "valueObjectParams", {
        get: function () {
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
            var valueObj = Utils.getObjectFromString(this.valueObjectParams);
            var partMatch = /(?:^[\{\s"]*([a-zA-Z0-9]+):(?:.)*)/.exec(part);
            if (partMatch) {
                var key = partMatch[1];
                partOfValue = valueObj.hasOwnProperty(key);
            }
        }
        else if (part && this.containsValueArrayLiteral) {
            var valueArr = Utils.getArrayFromString(this.valueArrayParams);
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
    Property.prototype.toMarkup = function () {
        var nameParts = this.name.split(':');
        var comment = this.comment && this.comment.commentText ? '\n' + this.comment.toMarkup() : '\n' + this.derivedComment.toMarkup();
        var propStr = comment;
        propStr += '\t\t\t' + nameParts[0];
        propStr += ': ';
        propStr += this._parseParams();
        return propStr;
    };
    return Property;
}(ProgramPart));
exports.Property = Property;
var ComputedProperty = (function (_super) {
    __extends(ComputedProperty, _super);
    function ComputedProperty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ComputedProperty.prototype, "methodName", {
        get: function () {
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
        newParamStr += '\t\t\t\tcomputed: \'' + this.methodName + '\'\n';
        newParamStr += '\t\t\t}';
        return newParamStr;
    };
    ComputedProperty.prototype.toMarkup = function () {
        var nameParts = this.name.split(':');
        var comment = this.comment && this.comment.commentText ? '\n' + this.comment.toMarkup() : '\n' + this.derivedComment.toMarkup();
        var propStr = comment;
        propStr += '\t\t\t' + nameParts[0];
        propStr += ': ';
        propStr += this._getNewParams();
        return propStr;
    };
    return ComputedProperty;
}(Property));
exports.ComputedProperty = ComputedProperty;

//# sourceMappingURL=index.js.map
