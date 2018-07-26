// ------------------------------------
// Selectors
// ------------------------------------
export const getUndoQueue = state => state.undoHistory.undoQueue;
export const getUndoItems = state => getUndoQueue(state)[0];
export const getRedoItems = state => state.undoHistory.redoQueue[0];
export const canUndo = state => state.undoHistory.undoQueue.length > 0;
export const canRedo = state => state.undoHistory.redoQueue.length > 0;
