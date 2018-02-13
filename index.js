"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var behavior_1 = require("./models/behavior");
var comment_1 = require("./models/comment");
var component_1 = require("./models/component");
var computed_1 = require("./models/computed");
var function_1 = require("./models/function");
var html_comment_1 = require("./models/html-comment");
var listener_1 = require("./models/listener");
var observer_1 = require("./models/observer");
var property_1 = require("./models/property");
var Models = (function () {
    function Models() {
        this.Behavior = behavior_1.Behavior;
        this.Comment = comment_1.Comment;
        this.Component = component_1.Component;
        this.ComputedProperty = computed_1.ComputedProperty;
        this.Function = function_1.Function;
        this.HtmlComment = html_comment_1.HtmlComment;
        this.Listener = listener_1.Listener;
        this.Observer = observer_1.Observer;
        this.Property = property_1.Property;
    }
    return Models;
}());
exports.Models = Models;
module.exports.Models = Models;

//# sourceMappingURL=index.js.map
