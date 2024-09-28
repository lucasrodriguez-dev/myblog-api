const validator = require("validator");

const validate = (params) => {
    if ((validator.isEmpty(params.title)) ||
        (!validator.isLength(params.title, { min: 5, max: 50 })) ||
        (validator.isEmpty(params.content))) {
        throw new Error("Datos no válidos");
    }
};

module.exports = {
    validate
};