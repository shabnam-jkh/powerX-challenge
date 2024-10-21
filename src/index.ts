import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { addReading, getReading } from './database';
import { createMetric, getMetrics } from './controllers/metricController';

dotenv.config();

const PORT = process.env.PORT || 3000;
export const app: Express = express();

app.use(helmet());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.post('/data', async (req: Request, res: Response) => {

  const result = createMetric(req.body)
  return res.json({ success: result });
});

app.get('/data', async (req, res) => {

  const { from, to } = req.query;
  if (!from || !to)
    return res.status(400).json({ error: 'Missing date range' });

  try {
    const result = getMetrics(from as string, to as string)
    return res.json(result);
  }
  catch (error) {
    return res.status(400).json({
      error:
        error instanceof Error ? error.message : "Unknown Error occured"
    });
  }
});

app.listen(PORT, () => console.log(`Running on port ${PORT} ⚡`));
