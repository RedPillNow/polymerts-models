import {Behavior as PolymerBehavior} from './models/behavior';
import {Comment as PolymerComment} from './models/comment';
import {Component as PolymerComponent} from './models/component';
import {ComputedProperty as PolymerComputedProperty} from './models/computed';
import {Function as PolymerFunction} from './models/function';
import {HtmlComment as PolymerHtmlComment} from './models/html-comment';
import {Listener as PolymerListener} from './models/listener';
import {Observer as PolymerObserver} from './models/observer';
import {Property as PolymerProperty} from './models/property';
import * as Utils from './lib/utils';

export class Models {
	Behavior = PolymerBehavior;
	Comment = PolymerComment;
	Component = PolymerComponent;
	ComputedProperty = PolymerComputedProperty;
	Function = PolymerFunction;
	HtmlComment = PolymerHtmlComment;
	Listener = PolymerListener;
	Observer = PolymerObserver;
	Property = PolymerProperty;
}

module.exports.Models = Models;
