const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

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