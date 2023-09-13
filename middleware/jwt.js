const jwt = require('jsonwebtoken');

const generateToken = (userdata)=>{
    try {
        const jwtSecretToken = process.env.JWTSECRETTOKEN;
        const expiresIn = '1d';
        const options = {
            expiresIn: expiresIn,
          };
        const token = jwt.sign(userdata,jwtSecretToken,options);
        if(!token){
            return 'Something went wrong'
        };
        return token;
    } catch (error) {
        console.log(error);
        return error.message;
    }
}

const requireSignIn = (req,res,next) => {
    try {
        if(req.headers.authorization){
            const jwtSecretToken = process.env.JWTSECRETTOKEN
            const token = req.headers.authorization;
            const user = jwt.verify(token,jwtSecretToken);
            req.user = user
        }else{
            return "Invalid Token"
        }
        next()
    } catch (error) {
        console.log(error);
        return error.message
    }
}

module.exports ={ generateToken, requireSignIn}