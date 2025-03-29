const validateEmailDomain = (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Extract domain from email
    const domain = email.split('@')[1];
    
    // List of allowed domains
    const allowedDomains = ['gmail.com', 'tothenew.com'];
    
    if (!allowedDomains.includes(domain)) {
        req.flash('error', 'Only Gmail and ToTheNew email addresses are allowed');
        return res.redirect('/register');
    }
    next();
};

module.exports = validateEmailDomain; 