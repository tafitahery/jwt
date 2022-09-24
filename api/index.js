const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

const users = [
  {
    id: '1',
    username: 'jhon',
    password: 'jhon0908',
    isAdmin: true,
  },
  {
    id: '2',
    username: 'jane',
    password: 'jane0908',
    isAdmin: false,
  },
];

let refreshTokens = [];

app.post('/api/refresh', (req, res) => {
  //take the refresh token from user
  const refreshToken = req.body.token;

  //send error if there is no token or it's invalid
  if (!refreshToken) return res.status(401).json('You are not authenticated!');
  if (!refreshTokens.includes(refreshToken)) {
    res.status(403).json('Refresh token is not valid!');
  }
  jwt.verify(refreshToken, 'myRefreshSecretKey', (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshAccessToken = generateRefreshAccessToken(user);

    refreshTokens.push(newRefreshAccessToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshAccessToken,
    });
  });

  //if everything is ok, create new access token, refresh token and send to user
});

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'mySecretKey', {
    expiresIn: '15m',
  });
};

const generateRefreshAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'myRefreshSecretKey');
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    //Generate an access token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshAccessToken(user);
    refreshTokens.push(refreshToken);
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json('Username or password is incorrect');
  }
});

const verify = (req, res, next) => {
  const autHeader = req.headers.authorization;
  if (autHeader) {
    const token = autHeader.split(' ')[1];

    jwt.verify(token, 'mySecretKey', (err, user) => {
      if (err) {
        return res.status(403).json('Token is not valid');
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json('You are not authentificated');
  }
};

app.delete('/api/users/:userId', verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json('User has been deleted.');
  } else {
    res.status(403).json('You are not allowed to delete this user!');
  }
});

app.post('/api/logout', verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json('You logged out successfully.');
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
