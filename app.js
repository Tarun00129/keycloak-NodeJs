const cors = require('cors');
const express = require('express');
const keycloak = require('./middlewares/keycloak'); // Keycloak
const menuItems = require('./middlewares/menuItems');
const dotenv = require('dotenv').config();

const port = process.env.PORT;

// Routes
const testRoutes = require('./routes/test');

const errorHandler = (error, req, res, next) => {
  const status = error.status || 422;
  res.status(status).send(error.message);
}

const app = express();

app.use(keycloak.middleware());
app.use(express.json());
app.use(cors());

// Register routes
// app.use('/api', testRoutes);
app.use('/api',menuItems);
app.use(errorHandler);

app.get('/api/secure', keycloak.protect(), (req, res) => {
  const isAdmin = req.kauth.grant.access_token.hasRealmRole('admin');
  const isUser = req.kauth.grant.access_token.hasRealmRole('user');

  if (isAdmin && isUser) {
    // console.log("Admin-User");
    res.json({ user: "**Admin-User**", project: 'keycloak_project', release: '1.0.0', description: 'API for appuser' });
  } else if (isAdmin) {
    // console.log("Admin");
    res.json({ user: "**Admin**", project: 'keycloak_project', release: '1.0.0', description: 'API for appuser' });
  } else if (isUser) {
    // console.log("User");
    res.json({ user: "**user**", project: 'keycloak_project', release: '1.0.0', description: 'API for appuser' });
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
});

app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});