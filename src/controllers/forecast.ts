import { AuthMiddleware } from '@src/middlewares/auth';
import { Controller, Get, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(AuthMiddleware)
export class ForecastController {
  @Get('')
  public async getForecastForLoggedUser(req: Request, res: Response): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (error) {
      res.status(500).send({ error: `Something went wrong -> ${error}` });
    }
  }
}
