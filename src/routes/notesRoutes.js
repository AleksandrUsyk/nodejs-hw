import express from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notesController.js';

export const notesRouter = express.Router();

notesRouter.get('/', getAllNotes);
notesRouter.get('/:noteId', getNoteById);
notesRouter.post('/', createNote);
notesRouter.patch('/:noteId', updateNote);
notesRouter.delete('/:noteId', deleteNote);
