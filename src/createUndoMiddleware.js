import { UNDO, REDO, GROUP, beginGroup, endGroup, addUndoItem } from './actions';
import { getUndoItems, getRedoItems } from './selectors';

export default function createUndoMiddleware({ revertingActions }) {
  let acting = false;

  function getUndoAction(undoItem) {
    const { action, args } = undoItem;
    const { type } = action;
    const actionCreator = revertingActions[type].action || revertingActions[type];
    return actionCreator(action, args);
  }

  function getUndoArgs(state, action) {
    const argsFactory = revertingActions[action.type].createArgs;
    return argsFactory && argsFactory(state, action);
  }

  function undo({ dispatch, state }) {
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

  function redo({ dispatch, state }) {
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

  function group({ dispatch, next, action }) {
    next(beginGroup());
    const groupedActions = action.payload;
    groupedActions.forEach(dispatch);
    next(endGroup());
  }

  function defaultHandler({ dispatch, state, action }) {
    if (!acting && revertingActions[action.type]) {
      dispatch(addUndoItem(action, getUndoArgs(state, action)));
    }
  }

  return function undoMiddleware({ dispatch, getState }) {
    const actionHandlers = {
      [UNDO]: undo,
      [REDO]: redo,
      [GROUP]: group
    };

    return next => action => {
      const state = getState();
      const ret = next(action);
      const actionHandler = actionHandlers[action.type] || defaultHandler;
      actionHandler({ dispatch, next, state, action });
      return ret;
    };
  };
}
