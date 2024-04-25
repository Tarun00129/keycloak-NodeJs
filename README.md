Hii,

Today we’re going to be exploring how to build a simple Role Based Access Control (RBAC) for your Node.js & Express.js API using Keycloak for authentication.

While searching for a solution to secure my Node + Express APIs with Keycloak authentication, I came across the Keycloak Node.js Adapter, keycloak-connect. While it does help simplify the process of verifying Bearer tokens that came with every request, however trying to verify if a user has a specific role to access certain routes quickly became slightly more complicated.

After some digging, I was able to come up with a solution that doesn’t require much configurations on Keycloak. Let’s get into it.

**Prerequisites**

This guide expects you to already have your own Keycloak setup, This guide also expects you to already have a way to generate user’s access token.

**Create a new Node.js project**

Firstly, let’s start a new Node.js project locally.

**npm init**

You may change the configurations as you wish, I mainly just use the default.

**Let’s install some packages we need for this project.**

_npm i cors dotenv express jsonwebtoken keycloak-connect nodemon_

You can read up more about each of these packages through their own official documentation.

We’re going to use jsonwebtoken to read the Bearer tokens parsed in through all our API requests & keycloak-connect to verify the tokens.

To run our API server locally, we’ll have to add a script into the package.json file so it knows which file to run. Under the “scripts”, add this line into the object.

// file: package.json

...

"start": "nodemon app.js", 

...
For ease of usage, I’ve also added path aliases for the routes & middlewares directories into the package.json file.

// file: package.json

...

"imports": {
  "#routes/*": "./routes/*.js",
  "#middlewares/*": "./middlewares/*.js"
}

...
**Create a base project**
To test if our API is working, let’s create a simple base project. Add index.js file to your root folder.

// file: app.js

require('dotenv').config();
const cors = require('cors');
const express = require('express');

const port = process.env.PORT;

// Routes
const testRoutes = require('#routes/test');

const errorHandler = (error, req, res, next) => {
  const status = error.status || 422;
  res.status(status).send(error.message);
}

const app = express();

app.use(express.json());
app.use(cors());

// Register routes
app.use('/api', testRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});

Noticed how we’re using env variables in here?

You need to create a .env file for your project if you haven’t already done that & assign a port number of your choosing for your API.

We’re also using a route file for testing, let’s create that next.

// file: routes/test.js

const express = require('express');
const router = express.Router();

// Test Route
router.get('/test', (req, res) => {
  res.json({
    message: "API connection established.",
    status: "success"
  })
  .status(200);
});

module.exports = router;

**Let’s fire up the base project**

To start the API locally, just run this in your terminal :

_npm start_

You should see something like “Server Started at <port>” displayed in your terminal.

Too see if everything is working, just open http://localhost:<port>/api/test in your browser. You should see the response object we have created in our test.js route file. That means our base project is working as expected.

**Configuring Keycloak for usage**

With the Keycloak that you have setup, 

**STEP 1**:create a new realm for this project. I simply named mine “MYREALM”. {You Can use any Name}

Go into the realm you have just created, 

**STEP 2**:select “Clients” & click on the “Create Client” button in the “Client list” tab. In the “Create client” form, under “General Settings”, give your client a new **Client ID**.


**STEP 3**:Head over to “Realm roles” on your left & click the “Create role” button. We’re going to create an admin role for the realm.


Now go back to “Realm roles” & you should be able to see the admin role you’ve just created.

Now that we have our realm & client, we need some users, just 2 will do. One is going to be an admin user, one is going to be a normal user.
Head over to “Users” & click on the “Add user” button.
Once your Admin user has been created, go into the user’s “User details” page & setup a password for your user under the “Credentials” tab.

Go back to the “Users” page once again & add another user.

Don’t forget to create a password for Karen too.
Go back to “Users” & you should now have TWO users in the list, Admin & Karen.

Let’s click into our Admin user & assign a role for the user under the “Role mapping” tab.
You should now see that our Admin user have the “admin” role assigned.

That’s all that we need to configure on Keycloak for us to start working on the RBAC.

**Implementing RBAC into the API**

First, you’ll have to add your Keycloak Realm & Client ID into your .env file.
Please change the KEYCLOAK_URL according to where your Keycloak is.

**Setting up Keycloak Middleware**
To be able to use keycloak-connect as a middleware for our routes, we’d have to create a new middleware for it.

Code:-

// file: middlewares/keycloak.js

const Keycloak = require("keycloak-connect");
const dotenv = require('dotenv').config();
const config = {
  "realm": process.env.KEYCLOAK_REALM,
  "auth-server-url": `${process.env.KEYCLOAK_URL}`,
  "ssl-required": "external",
  "resource": process.env.KEYCLOAK_CLIENT,
  "bearer-only": true
}
module.exports = new Keycloak({}, config);

Then we’d have to tell our index.js to use the middleware we’ve just created.

// file: index.js
...
const express = require('express');
const keycloak = require('#middlewares/keycloak'); // Keycloak
...
app.use(keycloak.middleware());
app.use(express.json());
...

**Adding the Keycloak middleware to routes**

Let’s create a new route file where we’re going to use the middleware.

// file: routes/menuItems.js

const express = require("express");
const router =  express.Router();

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
    name:"Latte",
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
[keycloak.protect()],
async ( req, res, next) => {
  try {
    let filtered = menuItems.filter(item => {
      if (item.onMenu === true) {
        return item;
      }
    });
    res.json(filtered);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
We’re going to tell our routes to return a set of data, which you would normally do from a database but for the purpose of this tutorial, we’ll just use some fake data.

**Testing the Keycloak middleware**

**_NOTE: This is where you should generate your user’s Access Token_**

Assuming you are parsing your Bearer token into the authorization header of your request, then you should get a response with only the menu items that are on the menu. The /menu-items route is open to every user, so both Admin & Karen should be able to get the same response.

You can test this out with **Postman**.
