import express from 'express';
import axios from 'axios';

const router = express.Router();
const THEMEALDB_API = 'https://www.themealdb.com/api/json/v1/1';

// Search meals by keyword
router.get('/meals/search', async (req, res) => {
  try {
    const s = req.query.s || '';
    
    const response = await axios.get(`${THEMEALDB_API}/search.php?s=${s}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching meals:', error.message);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Get random meal
router.get('/meals/random', async (req, res) => {
  try {
    const response = await axios.get(`${THEMEALDB_API}/random.php`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching random meal:', error.message);
    res.status(500).json({ error: 'Failed to fetch random meal' });
  }
});

// Get meals by category
router.get('/meals/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const response = await axios.get(`${THEMEALDB_API}/filter.php?c=${category}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching meals by category:', error.message);
    res.status(500).json({ error: 'Failed to fetch meals by category' });
  }
});

// Get meal by ID
router.get('/meals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${THEMEALDB_API}/lookup.php?i=${id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching meal detail:', error.message);
    res.status(500).json({ error: 'Failed to fetch meal detail' });
  }
});

export default router;
