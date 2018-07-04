import { get, includes } from "lodash";
import { addUndoItem } from "./actions";
import { getUndoItem, getRedoItem } from "./selectors";

export default function createUndoMiddleware({ revertingActions }) {
  let acting = false;

  return ({ dispatch, getState }) => next => action => {
    const state = getState();
    const ret = next(action);

    switch (action.type) {
      case "UNDO_HISTORY@UNDO":
        {
          const undoItem = getUndoItem(state);
          if (undoItem) {
            acting = true;
            dispatch(getUndoAction(undoItem));
            acting = false;
          }
        }
        break;
      case "UNDO_HISTORY@REDO":
        {
          const redoItem = getRedoItem(state);
          if (redoItem) {
            acting = true;
            dispatch(redoItem.action);
            acting = false;
          }
        }
        break;
      default:
        if (!acting && revertingActions[action.type]) {
          dispatch(addUndoItem(action, getUndoArgs(state, action)));
        }
        break;
    }

    return ret;
  };

  function getUndoAction(undoItem) {
    const { action, args } = undoItem;
    const { type } = action;
    const actionCreator =
      revertingActions[type].action || revertingActions[type];
    return actionCreator(action, args);
  }

  function getUndoArgs(state, action) {
    let argsFactory = revertingActions[action.type].createArgs;
    return argsFactory && argsFactory(state, action);
  }
}
