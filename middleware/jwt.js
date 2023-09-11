const jwt = require('jsonwebtoken');

const generateToken = (userdata)=>{
    try {
        const jwtSecretToken = "thisisfortestingpurpose";
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

const verifyToken = (token) => {
    try {
        const jwtSecretToken = "thisisfortestingpurpose"
        const verify = jwt.verify(token,jwtSecretToken);
        if(verify){
            return verify
        }else{
            return "invalid token"
        }
    } catch (error) {
        console.log(error);
        return error.message
    }
}

module.exports ={ generateToken, verifyToken}