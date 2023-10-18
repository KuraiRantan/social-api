const { validateToken } = require('../helpers/validateToken');


const authentication = (req, res, next) => {
    const bearerToken = req.headers.authorization;
    let token = null;
    let user = null;
    if(bearerToken && bearerToken.startsWith('Bearer')){
        token = bearerToken.split(' ')[1];
        user = validateToken(token);
    }
    
    if(user){
        req.user = user;
        return next();
    }
    res.status(301).json({message: 'Error al realizar solicitud', error: 'Solicitud no autorizada o token invalido'});
};


module.exports = authentication;