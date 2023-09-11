const {generateToken} = require('../middleware/jwt')
const bcrypt  = require('bcrypt');
const User = require('../model/user')


const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password
  
    if (!email) {
      return res
        .status(400)
        .json({ message: "Username not found", code: "Please fill username" });
    }
  
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password not found", code: "Please fill password" });
    }
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(isMatch){
      let userdata = {
        userId:user._id,
        useremail:user.email
      }
       let usertoken = await generateToken(userdata)
       res.status(200).json({token:usertoken,user:user})
    }
  } catch (error) {
    console.log(error);
    return error.message
  }
};

const register = async (req,res) => {
  try {
    const {email,username,password,confirmPassword} = req.body;
    const checkEmail = await User.findOne({email:email});
    if (checkEmail){
      return res.json({message:"User already exist please login"})
    }
    if(password !== confirmPassword){
      return res.status(403).json({message:"password doesn't match"})
    }
    let hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({
      username:username,
      email:email,
      password:hashedPassword
    })
    if(!user){
      return res.status(500).json({message:"Something went wrong"})
    }
    res.status(201).json({
      message:"user registered successfully"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({error:error.message})
  }
}

module.exports = { login, register };
