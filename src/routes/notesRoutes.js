import express from 'express';
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

export const notesRouter = express.Router();

notesRouter.get('/', getAllNotesSchema, getAllNotes);

notesRouter.get('/:noteId', noteIdSchema, getNoteById);

notesRouter.post('/', createNoteSchema, createNote);

notesRouter.patch('/:noteId', updateNoteSchema, updateNote);

notesRouter.delete('/:noteId', noteIdSchema, deleteNote);
