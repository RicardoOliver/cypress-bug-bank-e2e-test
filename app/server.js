const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const users = {
  qa_user: { password: 'Password123!', blocked: false },
  blocked_user: { password: 'Password123!', blocked: true }
};

let latestOrder = null;

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (user.blocked) {
    return res.status(403).json({ error: 'Access denied' });
  }
  return res.status(200).json({ token: `token-${username}`, username });
});

app.post('/api/orders', (req, res) => {
  const { amount, reference } = req.body;
  if (amount < 1 || amount > 10000) {
    return res.status(422).json({ error: 'Order amount out of allowed range' });
  }
  latestOrder = { amount, reference, createdAt: new Date().toISOString() };
  return res.status(201).json(latestOrder);
});

app.get('/api/orders/latest', (_req, res) => {
  if (!latestOrder) {
    return res.status(404).json({ error: 'No orders found' });
  }
  return res.status(200).json(latestOrder);
});

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

module.exports = app;
