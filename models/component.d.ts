import { ProgramPart } from './program-part';
import { Property } from './property';
import { Observer } from './observer';
import { Behavior } from './behavior';
import { Listener } from './listener';
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