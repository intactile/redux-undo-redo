import {
  UNDO,
  REDO,
  GROUP,
  beginGroup,
  endGroup,
  addUndoItem,
  getUndoItems,
  getRedoItems
} from "./undoReduxModule";

export default function createUndoMiddleware({ revertingActions }) {
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

  let acting = false;
  return ({ dispatch, getState }) => next => action => {
    const state = getState();
    const ret = next(action);

    switch (action.type) {
      case UNDO:
        {
          const undoItems = getUndoItems(state);
          if (undoItems) {
            acting = true;
            for (let index = 0; index < undoItems.length; index++) {
              const undoItem = undoItems[index];
              dispatch(getUndoAction(undoItem));
            }
            acting = false;
          }
        }
        break;
      case REDO:
        {
          const redoItems = getRedoItems(state);
          if (redoItems) {
            acting = true;
            for (let index = redoItems.length - 1; index >= 0; index--) {
              const redoItem = redoItems[index];
              dispatch(redoItem.action);
            }
            acting = false;
          }
        }
        break;
      case GROUP: {
        const groupedAction = action.payload;
        next(beginGroup());
        const result = next(groupedAction);
        next(endGroup());
        return result;
      }
      default:
        if (!acting && revertingActions[action.type]) {
          dispatch(addUndoItem(action, getUndoArgs(state, action)));
        }
        break;
    }

    return ret;
  };
}
