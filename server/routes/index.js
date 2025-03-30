const express = require("express");
const adminRouter = require("./adminRouter");

const router = express.Router();

const usersRouter = require("./usersRouter");
router.use("/users", usersRouter);


router.use("/admin", adminRouter);

module.exports = router; 
