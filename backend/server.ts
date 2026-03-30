import express from 'express';
import type { Application, Request, Response } from 'express';
import { z } from 'zod';
import AccountRouter from './Routes/AccountRoutes.ts';
import TransactionRouter from './Routes/TransactionRoutes.ts';  


const app: Application = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// Zod Schema
const BodySchema = z.object({
  name: z.string(),
});

// POST Route with Validation
app.post('/name', (req: Request, res: Response) => {
  const parsed = BodySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body' });
  }

  const { name } = parsed.data;
  console.log(name);

  res.send('return name: ' + name);
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use('/api/accounts', AccountRouter);
app.use('/api/transactions', TransactionRouter);