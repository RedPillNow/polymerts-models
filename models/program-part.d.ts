import { Comment } from './comment';
import * as ts from 'typescript';
export declare abstract class ProgramPart {
    private _comment;
    private _endLineNum;
    private _startLineNum;
    private _tsNode;
    abstract toMarkup(): string;
    comment: Comment;
    endLineNum: number;
    startLineNum: number;
    tsNode: ts.Node;
}
