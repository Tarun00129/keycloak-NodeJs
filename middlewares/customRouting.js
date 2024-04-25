// Define a middleware function to check roles
const express = require("express");
const router =  express.Router();

// Middleware
const keycloak = require("#middlewares/keycloak");

function checkRole(role) {
    return function(req, res, next) {
      if (req.kauth && req.kauth.accessToken && req.kauth.accessToken.content) {
        const roles = req.kauth.accessToken.content.realm_access.roles;
        if (roles.includes(role)) {
          next();
        } else {
          res.status(403).json({ message: 'Forbidden' });
        }
      } else {
        res.status(401).json({ message: 'Unauthorized' });
      }
    };
  }
  
  // Protect the API with the 'admin' role
  app.get('/protected', checkRole('admin'), (req, res) => {
    res.json({ message: 'This is a protected API' });
  });
  
module.exports = router;
