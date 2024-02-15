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
            console.log("middle:" + req.session.userId);
            res.redirect('/');
        } else {
            // User is not logged in, continue to the next middleware or route handler
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}



const isAdminLogin = async (req, res, next) => {
    try {
        if (req.session.admin_id) {
            next()
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('500');
    }
}
const isAdminLogout = async (req, res, next) => {
    try {
        if (req.session.admin_id) {
            res.redirect('/admin/dashboard')
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('500');
    }
}



module.exports={
    isLogin,
    isLogout,
    isAdminLogin,
    isAdminLogout
}