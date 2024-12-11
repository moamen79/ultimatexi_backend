const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Updated CORS configuration to allow requests from your S3 bucket
app.use(cors({
  origin: [
    'http://ultimatexi.s3-website-us-east-1.amazonaws.com',
    'http://localhost:3000'  // Keep localhost for development
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static file serving
app.use(express.static('public'));

// Parse JSON bodies
app.use(express.json());

app.get('/api/popularPlayers', async (req, res) => {
  try {
    let originalData = require('./public/data/api.json');

    const sevenDaysAgo = new Date();  
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const modifiedData = JSON.parse(JSON.stringify(originalData)); // Create a deep copy

    modifiedData.data.forEach(entry => {
      entry.search_history = entry.search_history.filter(dateStr => {
        const searchDate = new Date(dateStr);
        return searchDate > sevenDaysAgo;
      });
    });

    var sortedData = modifiedData.data.sort((a, b) => {
      const playerLeagueA = a.name.toLowerCase() + ' ' + a.league.toLowerCase();
      const playerLeagueB = b.name.toLowerCase() + ' ' + b.league.toLowerCase();
      return playerLeagueA.localeCompare(playerLeagueB);
    });

    sortedData = sortedData.sort((a, b) => {
      return b.search_history.length - a.search_history.length;
    });

    const popularPlayers = sortedData.slice(0, 3);

    res.json(popularPlayers);
  } catch (error) {
    console.error('There has been an error reading the JSON file:', error);
    res.status(500).send('An error occurred while retrieving the popular players');
  }
});

app.get('/api/leagues', async (req, res) => {
  try {
    const data = require('./public/data/api.json');

    const leagues = [...new Set(data.data.map(entry => entry.league))];

    leagues.sort();

    res.json(leagues);
  } catch (error) {
    console.error('There has been an error reading the JSON file:', error);
    res.status(500).send('An error occurred while retrieving the leagues');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});