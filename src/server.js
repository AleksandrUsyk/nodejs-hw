import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notesRouter } from './routes/notesRoutes.js';

const app = express();

app.use(logger);
app.use(cors());
app.use(express.json());

app.use('/notes', notesRouter);

app.use(errors());

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectMongoDB();

  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`🚀 Server running on http://localhost:${port}`),
  );
};

startServer();
