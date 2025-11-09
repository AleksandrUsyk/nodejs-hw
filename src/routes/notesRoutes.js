import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notesController.js';
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';
import { authenticate } from '../middleware/authenticate.js';

export const notesRouter = express.Router();

notesRouter.use(authenticate);

notesRouter.get(
  '/',
  celebrate({ [Segments.QUERY]: getAllNotesSchema }),
  getAllNotes,
);

notesRouter.get(
  '/:noteId',
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  getNoteById,
);

notesRouter.post(
  '/',
  celebrate({ [Segments.BODY]: createNoteSchema }),
  createNote,
);

notesRouter.patch(
  '/:noteId',
  celebrate({
    [Segments.PARAMS]: noteIdSchema,
    [Segments.BODY]: updateNoteSchema,
  }),
  updateNote,
);

notesRouter.delete(
  '/:noteId',
  celebrate({ [Segments.PARAMS]: noteIdSchema }),
  deleteNote,
);
