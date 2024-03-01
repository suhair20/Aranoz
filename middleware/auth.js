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
        res.status(500).render('user/500');
    }
}

const isLogout = (req, res, next) => {
    try {
        if (req.session.userId) {
            
            console.log("middle:" + req.session.userId);
            res.redirect('/');
        } else {
          
            next();
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('user/500');
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
        res.status(500).render('user/500');
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
        res.status(500).render('user/500');
    }
}



module.exports={
    isLogin,
    isLogout,
    isAdminLogin,
    isAdminLogout
}