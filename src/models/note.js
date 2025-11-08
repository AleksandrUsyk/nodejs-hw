import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

export const createNote = async (req, res, next) => {
  try {
    const { title, content, tag } = req.body;
    const userId = req.user._id;

    const note = await Note.create({ title, content, tag, userId });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

export const getAllNotes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notes = await Note.find({ userId });
    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: id, userId });
    if (!note) throw createHttpError(404, 'Note not found');

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title, content, tag } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { title, content, tag },
      { new: true },
    );

    if (!note) throw createHttpError(404, 'Note not found');

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findOneAndDelete({ _id: id, userId });
    if (!note) throw createHttpError(404, 'Note not found');

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
