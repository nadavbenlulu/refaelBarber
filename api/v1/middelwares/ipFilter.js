module.exports=(req,res,next)=>{
    const allowIps=['::1','1.5.88.99'];
    for(let i=0;i<allowIps.length;i++)
    {
        if(req.ip==allowIps[i])
        {
            return next();
        }
    }
    return res.status(401).json({msg:'you are not authorized'});
};
