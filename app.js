const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const DATA_PATH = './data/bonuses.json';

function loadBonuses() {
  const data = fs.readFileSync(DATA_PATH);
  return JSON.parse(data);
}

function saveBonuses(bonuses) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(bonuses, null, 2));
}

app.get('/', (req, res) => {
  res.render('claim');
});

app.post('/claim', (req, res) => {
  const name = req.body.name.trim().toLowerCase();
  const bonuses = loadBonuses();
  const now = new Date();

  const match = bonuses.find(
    (b) => b.name.toLowerCase() === name &&
      new Date(b.expiry) >= now &&
      b.available &&
      !b.claimed
  );

  if (match) {
    match.claimed = true;
    saveBonuses(bonuses);
    res.render('result', { success: true, bonus: match });
  } else {
    res.render('result', { success: false });
  }
});

app.get('/admin', (req, res) => {
  const bonuses = loadBonuses();
  res.render('admin', { bonuses });
});

app.post('/admin/add', (req, res) => {
  const { name, bonus, expiry, available } = req.body;
  const bonuses = loadBonuses();
  bonuses.push({
    id: uuidv4(),
    name,
    bonus,
    expiry,
    available: available === 'true',
    claimed: false
  });
  saveBonuses(bonuses);
  res.redirect('/admin');
});

app.post('/admin/delete/:id', (req, res) => {
  const bonuses = loadBonuses().filter((b) => b.id !== req.params.id);
  saveBonuses(bonuses);
  res.redirect('/admin');
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});