import { Router, Request, Response } from 'express';
import { searchAirports } from '../services/airports';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const query = req.query.q;

  if (typeof query !== 'string' || query.length < 1) {
    return res.json([]);
  }

  const results = searchAirports(query);
  return res.json(results);
});

export default router;
