import request from 'supertest';
import app from '../server';

describe('POST /api/nearby-search', () => {

    it('should return 400 if no searchTerm is provided', async () => {
        const response = await request(app).post('/api/nearby-search').send({});
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Search term is required' });
    });

    it('should make request to TomTom API with correct params', async () => {
        const searchTerm = 'coffee';
        const latitude = '40.7128';
        const longitude = '-74.0060';
        const radius = '1000';
        const category = 'cafe';

        const response = await request(app)
            .post('/api/nearby-search')
            .send({ searchTerm, latitude, longitude, radius, category });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('results');
        expect(response.body.results[0]).toHaveProperty('poi');
        expect(response.body.results[0].poi).toHaveProperty('name');
    });

    it('should handle TomTom API errors', async () => {
        // Mock failed API response
        const mockJson = jest.fn().mockRejectedValueOnce(new Error('API Error'));
        const mockAxios = {
            get: jest.fn().mockReturnValue({ data: mockJson })
        };
        jest.mock('axios', () => mockAxios);

        const response = await request(app)
            .post('/api/nearby-search')
            .send({ searchTerm: 'test' });

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
    });

});
