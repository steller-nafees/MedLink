const paymentRepository = require("./payment.repository");

const getCustomerPayments = async (userId) => {
    return paymentRepository.getPaymentsByCustomerId(userId);
};

module.exports = {
    getCustomerPayments,
};
