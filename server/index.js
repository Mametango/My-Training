const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database('./training.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

// Create tables
function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    reps INTEGER,
    weight REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

// API Routes

// Get all workouts
app.get('/api/workouts', (req, res) => {
  const { date } = req.query;
  let query = 'SELECT * FROM workouts';
  let params = [];
  
  if (date) {
    query += ' WHERE date = ?';
    params.push(date);
  }
  
  query += ' ORDER BY date DESC, created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get workouts by date range
app.get('/api/workouts/range', (req, res) => {
  const { start_date, end_date } = req.query;
  
  if (!start_date || !end_date) {
    res.status(400).json({ error: 'Start date and end date are required' });
    return;
  }
  
  db.all(
    'SELECT * FROM workouts WHERE date BETWEEN ? AND ? ORDER BY date DESC, created_at DESC',
    [start_date, end_date],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Add new workout
app.post('/api/workouts', (req, res) => {
  const { date, muscle_group, exercise_name, reps, weight, notes } = req.body;
  
  if (!date || !muscle_group || !exercise_name) {
    res.status(400).json({ error: 'Date, muscle group, and exercise name are required' });
    return;
  }
  
  db.run(
    'INSERT INTO workouts (date, muscle_group, exercise_name, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [date, muscle_group, exercise_name, reps, weight, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        message: 'Workout added successfully'
      });
    }
  );
});

// Update workout
app.put('/api/workouts/:id', (req, res) => {
  const { id } = req.params;
  const { date, muscle_group, exercise_name, reps, weight, notes } = req.body;
  
  db.run(
    'UPDATE workouts SET date = ?, muscle_group = ?, exercise_name = ?, reps = ?, weight = ?, notes = ? WHERE id = ?',
    [date, muscle_group, exercise_name, reps, weight, notes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Workout not found' });
        return;
      }
      res.json({ message: 'Workout updated successfully' });
    }
  );
});

// Delete workout
app.delete('/api/workouts/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM workouts WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }
    res.json({ message: 'Workout deleted successfully' });
  });
});

// Get muscle groups
app.get('/api/muscle-groups', (req, res) => {
  const muscleGroups = [
    { id: 'chest', name: '胸', color: 'bg-red-500' },
    { id: 'shoulders', name: '肩', color: 'bg-orange-500' },
    { id: 'arms', name: '腕', color: 'bg-yellow-500' },
    { id: 'back', name: '背中', color: 'bg-green-500' },
    { id: 'legs', name: '脚', color: 'bg-blue-500' },
    { id: 'core', name: '体幹', color: 'bg-purple-500' }
  ];
  res.json(muscleGroups);
});

// Get exercise suggestions by muscle group
app.get('/api/exercises/:muscleGroup', (req, res) => {
  const { muscleGroup } = req.params;
  
  const exerciseSuggestions = {
    chest: ['ベンチプレス', 'ダンベルプレス', 'インクラインプレス', 'デクラインプレス', 'プッシュアップ'],
    shoulders: ['ショルダープレス', 'サイドレイズ', 'フロントレイズ', 'リアデルトフライ', 'アップライトロウ'],
    arms: ['バーベルカール', 'ダンベルカール', 'トライセップスエクステンション', 'ハンマーカール', 'ディップス'],
    back: ['デッドリフト', 'バーベルロウ', 'プルアップ', 'ラットプルダウン', 'シーテッドロウ'],
    legs: ['バーベルスクワット', 'レッグプレス', 'レッグエクステンション', 'ハックスクワット', 'シーテッドカーフレイズ'],
    core: ['プランク', 'クランチ', 'レッグレイズ', 'サイドプランク', 'ロシアンツイスト']
  };
  
  const exercises = exerciseSuggestions[muscleGroup] || [];
  res.json(exercises);
});

// Get workout statistics
app.get('/api/statistics', (req, res) => {
  const { start_date, end_date } = req.query;
  
  let dateFilter = '';
  let params = [];
  
  if (start_date && end_date) {
    dateFilter = 'WHERE date BETWEEN ? AND ?';
    params = [start_date, end_date];
  }
  
  db.all(
    `SELECT 
      muscle_group,
      COUNT(*) as workout_count,
      SUM(reps) as total_reps,
      AVG(weight) as avg_weight
    FROM workouts 
    ${dateFilter}
    GROUP BY muscle_group
    ORDER BY workout_count DESC`,
    params,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 