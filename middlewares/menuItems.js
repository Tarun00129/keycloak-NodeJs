const express = require("express");
const router = express.Router();
const userextrasController = require('../controllers/userextrasController');
const moviesController = require('../controllers/moviesController');

// Middleware
const keycloak = require("#middlewares/keycloak");

// Fake Data
const menuItems = [
  {
    name: "Croissant",
    price: "$1",
    onMenu: true
  },
  {
    name: "Latte",
    price: "$5",
    onMenu: true
  },
  {
    name: "Roti Canai",
    price: "$0.50",
    onMenu: true
  },
  {
    name: "Hot Chocolate",
    price: "$5",
    onMenu: false
  },
  {
    name: "Satay",
    price: "$8",
    onMenu: false
  },
  {
    name: "Pad Thai",
    price: "$7",
    onMenu: false
  }
];

// Route open to any role
router.get("/menu-items",
  [keycloak.protect('realm:user')],
  async (req, res, next) => {
    try {
      let filtered = menuItems.filter(item => {
        if (item.onMenu === true) {
          return item;
        }
      });

      // Return filtered data
      res.json(filtered);
    } catch (error) {
      return next(error);
    }
  });
function checkRole(roles) {
  return function (req, res, next) {
    if (req.kauth && req.kauth.grant.access_token && req.kauth.grant.access_token) {
      const roles2 = req.kauth.grant.access_token.content.realm_access.roles;
      console.log("roles2 :", roles2);
      if (roles.some(role => roles2.includes(role))) {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

// Protect the API with the 'admin' or 'user' roles
router.get('/protected', checkRole(['admin', 'user']), (req, res) => {
  res.json({ message: 'This is a protected API' });
});

router.get('/me', checkRole(['MOVIES_ADMIN', 'MOVIES_USER']), userextrasController.getUserExtras);
router.post('/me', checkRole(['MOVIES_ADMIN', 'MOVIES_USER']), userextrasController.updateUserAvatar);
router.post('/:imdbId/comments', checkRole(['MOVIES_ADMIN', 'MOVIES_USER']), userextrasController.createComment);

router.get('/', moviesController.getMovies);
router.post('/', checkRole(['MOVIES_ADMIN']), moviesController.createMovie);
router.delete('/:imdbId', checkRole(['MOVIES_ADMIN']), moviesController.deleteMovie);

module.exports = router;