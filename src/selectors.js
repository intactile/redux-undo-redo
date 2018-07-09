// ------------------------------------
// Selectors
// ------------------------------------
export const getUndoItems = state => state.undoHistory.undoQueue[0];
export const getRedoItems = state => state.undoHistory.redoQueue[0];
export const canUndo = state => state.undoHistory.undoQueue.length > 0;
export const canRedo = state => state.undoHistory.redoQueue.length > 0;
