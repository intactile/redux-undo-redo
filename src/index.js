import createMiddleware from "./createUndoMiddleware";
import reducer, { undo, redo, group } from "./undoReduxModule";
export const actions = { undo, redo, group };
export const undoReducer = reducer;
export const createUndoMiddleware = createMiddleware;
