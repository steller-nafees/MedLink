const express = require("express");

const authenticate = require("../../shared/middlewares/auth.middleware");
const { getPayments } = require("./payment.controller");

const router = express.Router();

const authorizeCustomer = (req, res, next) => {
    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized",
            statusCode: 403,
        });
    }

    next();
};

router.get("/", authenticate, authorizeCustomer, getPayments);

module.exports = router;
