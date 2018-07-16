import { canUndo, canRedo } from '../src/selectors';

describe('selectors', () => {
  describe('canUndo', () => {
    it('return true if the undo queue is not empty', () => {
      const state = {
        undoHistory: {
          undoQueue: [1, 2, 3]
        }
      };
      expect(canUndo(state)).toBe(true);
    });

    it('return false if the undo queue is not empty', () => {
      const state = {
        undoHistory: {
          undoQueue: []
        }
      };
      expect(canUndo(state)).toBe(false);
    });

    it('return false if the undo queue is not empty but pause is true', () => {
      const state = {
        undoHistory: {
          undoQueue: [1, 2, 3],
          pause: true
        }
      };
      expect(canUndo(state)).toBe(false);
    });
  });
  describe('canRedo', () => {
    it('return true if the redo queue is not empty', () => {
      const state = {
        undoHistory: {
          redoQueue: [1, 2, 3]
        }
      };
      expect(canRedo(state)).toBe(true);
    });

    it('return false if the redo queue is not empty', () => {
      const state = {
        undoHistory: {
          redoQueue: []
        }
      };
      expect(canRedo(state)).toBe(false);
    });

    it('return false if the redo queue is not empty but pause is true', () => {
      const state = {
        undoHistory: {
          redoQueue: [1, 2, 3],
          pause: true
        }
      };
      expect(canRedo(state)).toBe(false);
    });
  });
});
