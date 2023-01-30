describe('Beach forecast functional tests', () => {
    it('should return a forecast with just a few times', async () => {
        const { body, status } = await global.testRequest.get('/forecast');
        expect(status).toBe(200);
        expect(body).toEqual([
            {
                time: '2020-04-26T00:00:00+00:00',
                forecast: [
                    {
                        lat: -33.792726,
                        lng: 151.289824,
                        name: 'Manly',
                        position: 'E',
                        rating: 2,
                        swellDirecttion: 64.26,
                        swellHeight: 0.15,
                        swellPeriod: 3.89,
                        time: '2020-04-26T00:00:00+00:00',
                        waveDirection: 231.38,
                        windDirection: 299.45,
                    },
                ],
            },
            {
                time: '2020-04-26T01:00:00+00:00',
                forecast: [
                    {
                        lat: -33.792726,
                        lng: 151.289824,
                        name: 'Manly',
                        position: 'E',
                        rating: 2,
                        swellDirecttion: 64.26,
                        swellHeight: 0.15,
                        swellPeriod: 3.89,
                        time: '2020-04-26T00:00:00+00:00',
                        waveDirection: 231.38,
                        windDirection: 299.45,
                    },
                ],
            },
        ]);
    });
});
