import { Router, Request, Response } from 'express';
import { SearchParams } from '../types';
import { searchFlights } from '../services/amadeus';

const router = Router();

const VALID_CABIN_CLASSES = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
const IATA_CODE_REGEX = /^[A-Z]{3}$/;

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      cabinClass,
      flexibleDates,
    } = req.body;

    // Validate origin
    if (!origin || !IATA_CODE_REGEX.test(origin.toUpperCase())) {
      return res.status(400).json({
        error: 'Invalid origin. Must be a 3-letter IATA airport code.',
      });
    }

    // Validate destination
    if (!destination || !IATA_CODE_REGEX.test(destination.toUpperCase())) {
      return res.status(400).json({
        error: 'Invalid destination. Must be a 3-letter IATA airport code.',
      });
    }

    // Validate departure date
    if (!departureDate || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
      return res.status(400).json({
        error: 'Invalid departureDate. Must be in YYYY-MM-DD format.',
      });
    }

    // Validate return date if provided
    if (returnDate && !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
      return res.status(400).json({
        error: 'Invalid returnDate. Must be in YYYY-MM-DD format.',
      });
    }

    // Validate passengers
    const pax = Number(passengers);
    if (!Number.isInteger(pax) || pax < 1 || pax > 9) {
      return res.status(400).json({
        error: 'Invalid passengers. Must be an integer between 1 and 9.',
      });
    }

    // Validate cabin class
    if (!cabinClass || !VALID_CABIN_CLASSES.includes(cabinClass)) {
      return res.status(400).json({
        error: `Invalid cabinClass. Must be one of: ${VALID_CABIN_CLASSES.join(', ')}.`,
      });
    }

    const params: SearchParams = {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      returnDate: returnDate || undefined,
      passengers: pax,
      cabinClass,
      flexibleDates: flexibleDates === true,
    };

    const results = await searchFlights(params);

    return res.json({ results });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({
      error: 'An error occurred while searching for flights.',
    });
  }
});

export default router;
