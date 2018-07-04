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
            undoItems.forEach(undoItem => {
              dispatch(getUndoAction(undoItem));
            });
            acting = false;
          }
        }
        break;
      case REDO:
        {
          const redoItems = getRedoItems(state);
          if (redoItems) {
            acting = true;
            redoItems.reverse().forEach(redoItem => {
              dispatch(redoItem.action);
            });
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
