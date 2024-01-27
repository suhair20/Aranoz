const isLogin = (req, res, next) => {
    try {
        console.log("Executing isLogin middleware");

        if (req.session.userId) {
            // User is logged in, continue to the next middleware or route handler
            next();
        } else {
            res.redirect('/login');
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

const isLogout = (req, res, next) => {
    try {
        if (req.session.userId) {
            // User is logged in, redirect to the home page or another appropriate route
            console.log("middle:" + req.session.user_id);
            res.redirect('/');
        } else {
            // User is not logged in, continue to the next middleware or route handler
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isLogin,
    isLogout
}