import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/authRoutes.js';
import { notesRouter } from './routes/notesRoutes.js';
import { userRouter } from './routes/userRoutes.js'; // <-- новий

const app = express();

app.use(logger);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use('/users', userRouter); // <-- підключаємо роут для аватарів
app.use('/notes', notesRouter);

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

const startServer = async () => {
  await connectMongoDB();

  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`🚀 Server running on http://localhost:${port}`),
  );
};

startServer();
