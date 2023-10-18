const jwt = require('jsonwebtoken');

const validateToken = (token) => {
    let data = null;
    try {
        data = jwt.verify(token, 'jorge');
    } catch (error) {
        data = null;
    }

    return data;
}


module.exports = {
    validateToken,
}