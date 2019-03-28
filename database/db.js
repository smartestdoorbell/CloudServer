const Sequelize = require("sequelize");
const dbName = "myRings";
const dbUrl = process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`;

const db = new Sequelize(dbUrl, {
  logging: false
});

const User = db.define("users", {
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING
  },
  googleId: {
    type: Sequelize.STRING
  }
});

const Ring = db.define("rings", {
  eventTime: {
    type: Sequelize.DATE,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.STRING
  }
});

module.exports = {
  db,
  User,
  Ring
};