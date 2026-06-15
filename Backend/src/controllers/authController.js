const jwt=require('jasonwebtoken')

exports.login=async (req,res)=>{

    const {email,passwprd}=req.body

    const user=
    {
        id:'101',
        email:'kavyakiran@gmail.com',
        role:'customer'
    }

    const token=jwt.sign(
        {
            id:user.id,
            role:user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"1h"
        }
    );
    res.json({
        token
    });

}