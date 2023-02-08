import { InternalError } from "@src/util/errors/internal-error";
import * as HTTPUtil from '@src/util/request'
import config, { IConfig } from 'config'

export interface StormGlassPointSource {
    readonly [key: string]: number
}
export interface StormGlassPoint {
    readonly time: string
    readonly swellDirection: StormGlassPointSource
    readonly swellHeight: StormGlassPointSource
    readonly swellPeriod: StormGlassPointSource
    readonly waveDirection: StormGlassPointSource
    readonly waveHeight: StormGlassPointSource
    readonly windDirection: StormGlassPointSource
    readonly windSpeed: StormGlassPointSource
}
export interface StormGlassForecastResponse {
    readonly hours: StormGlassPoint[]
}
export interface ForecastPoint {
    swellDirection: number
    swellHeight: number
    swellPeriod: number
    time: string
    waveDirection: number
    waveHeight: number
    windDirection: number
    windSpeed: number
}
/**
 * This error type is used when a request reaches out to the StormGlass API but returns an error
 */
export class StormGlassUnexpectedResponseError extends InternalError {
    constructor(message: string) {
        super(message);
    }
}
/**
 * This error type is used when something breaks before the request reaches out to the StormGlass API
 * eg: Network error, or request validation error
 */
export class ClientRequestError extends InternalError {
    constructor(message: string) {
        const internalMessage =
            'Unexpected error when trying to communicate to StormGlass';
        super(`${internalMessage}: ${message}`);
    }
}
export class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const internalMessage =
            'Unexpected error returned by the StormGlass service';
        super(`${internalMessage}: ${message}`);
    }
}
const stormGlassResourceConfig: IConfig = config.get('App.resources.StormGlass');


export class StormGlass {
    private readonly stormGlassApiParams = 'swellDirection,swellHeight,swellPeriod,waveHeight,windDirection,windSpeed'
    private readonly stormGlassApiSource = 'noaa'
    constructor(protected request = new HTTPUtil.Request()) { }

    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
        try {
            const response = await this.request.get<StormGlassForecastResponse>(`${stormGlassResourceConfig.get('apiUrl')}?params=${this.stormGlassApiParams}&source=${this.stormGlassApiSource}&end=1592113802&lat=${lat}&lng=${lng}`,
                {
                    headers: {
                        Authorization: stormGlassResourceConfig.get('apiToken')
                    }
                })

            return this.normalizeResponse(response.data)
        } catch (err) {
            //@Updated 2022 to support Error as unknown
            //https://devblogs.microsoft.com/typescript/announcing-typescript-4-4/#use-unknown-catch-variables
            if (err instanceof Error && HTTPUtil.Request.isRequestError(err)) {
                const error = HTTPUtil.Request.extractErrorData(err);
                throw new StormGlassResponseError(
                    `Error: ${JSON.stringify(error.data)} Code: ${error.status}`
                );
            }
            /**
             * All the other errors will fallback to a generic client error
             */
            throw new ClientRequestError(JSON.stringify(err));
        }

    }
    private normalizeResponse(points: StormGlassForecastResponse): ForecastPoint[] {
        return points.hours
            .filter(this.isValidPoint.bind(this)).map((point) => ({
                swellDirection: point.swellDirection[this.stormGlassApiSource],
                swellHeight: point.swellHeight[this.stormGlassApiSource],
                swellPeriod: point.swellPeriod[this.stormGlassApiSource],
                waveDirection: point.waveDirection[this.stormGlassApiSource],
                waveHeight: point.waveHeight[this.stormGlassApiSource],
                windDirection: point.windDirection[this.stormGlassApiSource],
                windSpeed: point.windSpeed[this.stormGlassApiSource],
                time: point.time,
            }))

    }
    private isValidPoint(point: Partial<StormGlassPoint>): boolean {
        return !!(
            point.time &&
            point.swellDirection?.[this.stormGlassApiSource] &&
            point.swellHeight?.[this.stormGlassApiSource] &&
            point.swellPeriod?.[this.stormGlassApiSource] &&
            point.waveDirection?.[this.stormGlassApiSource] &&
            point.waveHeight?.[this.stormGlassApiSource] &&
            point.windDirection?.[this.stormGlassApiSource] &&
            point.windSpeed?.[this.stormGlassApiSource]
        )
    }
}