const express = require( 'express');
import axios from 'axios';
require('dotenv').config();
const cors = require('cors');
import { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY || 'Key';

app.use(cors());
app.use(express.json());

interface Iparams {
    key: string
    lat: number,
    lon: number,
    radius: string,
    limit: number, // Default limit to 10 results
    categorySet?:string
}

app.post('/api/nearby-search', async (req:Request, res:Response) => {
    console.log('nearby-search hit')

    console.log('the body is',req.body)
    try {
        console.log('nearby-search hit starting to work')
        let { searchTerm, latitude, longitude, radius, category } = req.body;
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        // Check if searchTerm is provided
        if (!searchTerm) {
            return res.status(400).json({ error: 'Search term is required' });
        }
        console.log("fine till here")
        // Set default values for category and limit
        const params: Iparams = {
            key: TOMTOM_API_KEY,
            lat: latitude,
            lon: longitude,
            radius: radius,
            limit: 10, // Default limit to 10 results
        };

        // Add category to params if provided
        if (category) {
            params.categorySet = category;
        }

        // Make request to TomTom API
        const response = await axios.get(`https://api.tomtom.com/search/2/search/${encodeURI(searchTerm)}.json`, {
            params: params,
        });

        res.json(response.data);
        console.log('Addresses returned: ', response.data)
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;