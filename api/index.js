const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

const users = [
  {
    id: 1,
    username: 'jhon',
    password: 'jhon0908',
    isAdmin: true,
  },
  {
    id: 2,
    username: 'jane',
    password: 'jane0908',
    isAdmin: false,
  },
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    //Generate an access token
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      'mySecretKey'
    );
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
    });
  } else {
    res.status(400).json('Username or password is incorrect');
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
