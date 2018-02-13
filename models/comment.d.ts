export declare enum ProgramType {
    Property = "PROPERTY",
    Computed = "COMPUTED",
    Component = "COMPONENT",
    Behavior = "BEHAVIOR",
    Listener = "LISTENER",
    Observer = "OBSERVER",
    Function = "FUNCTION",
}
export declare class Comment {
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
    toMarkup(): string;
}
