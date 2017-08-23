// worst routes ever
module.exports = (app) => {

    app.post('/proto1/agile-awareness/digital-and-agile-awareness-course', (req, res) => {
        if(req.body.eligible === "Yes") {
            res.redirect('select-your-course');
        } else if(req.body.eligible === "No") {
            res.redirect('../available-courses');
        } else {
            res.locals.errors = {
                eligible: {
                    param: 'eligible',
                    msg: 'confirm you are eligible'
                }
            };
            res.render('proto1/agile-awareness/digital-and-agile-awareness-course');
        }
    });

    app.post('/proto1/agile-foundation/digital-and-agile-foundation-course', (req, res) => {
        if(req.body.eligible === "Yes") {
            res.redirect('select-your-course');
        } else if(req.body.eligible === "No") {
            res.redirect('../available-courses');
        } else {
            res.locals.errors = {
                eligible: {
                    param: 'eligible',
                    msg: 'confirm you are eligible'
                }
            };
            res.render('proto1/agile-foundation/digital-and-agile-foundation-course');
        }
    });


    app.post('/proto1/*/select-your-course', (req, res) => {
        let path = req.path.split('/');
        if(Object.keys(req.body).length === 0) {
            res.locals.errors = {
                eligible: {
                    param: 'course',
                    msg: 'choose a course from the list below'
                }
            };
            res.render(`${path[1]}/${path[2]}/select-your-course`);
        } else {
            req.session.course = req.body["radio-group"];
            req.session.date = req.body["radio-group"].substring(req.body["radio-group"].indexOf(' '));
            req.session.location = req.body["radio-group"].substring(0, req.body["radio-group"].indexOf(' '));
            res.redirect(`/${path[1]}/${path[2]}/application-page`);
        }
    });

    app.get('/proto1/*/application-page', (req, res) => {
        let path = req.path.split('/');
        res.render(`proto1/${path[2]}/application-page`, {
            course: req.session.course,
            date: req.session.date,
            firstName: req.session.firstName,
            lastName: req.session.lastName,
            name: req.session.name,
            department: req.session.department,
            telephone: req.session.telephone,
            email: req.session.email,
            lineManager: req.session.lineManager
        });
    });

    app.post('/proto1/*/application-page', (req, res) => {
        let path = req.path.split('/');
        res.locals.errors = {};
        let elements = {firstName: "first name", lastName: "last name", department: "department", telephone: "telephone", email: "email", lineManager: "emergency contact"};
        for(let key in req.body) {
            if(req.body[key].length === 0) {
                res.locals.errors[key] = {
                    param: key,
                    msg: `enter your ${elements[key]}`
                };
            }
        }
        if(Object.keys(res.locals.errors).length === 0) {
            req.session.name = `${req.body.firstName} ${req.body.lastName}`;
            req.session.firstName = req.body.firstName;
            req.session.lastName = req.body.lastName;
            req.session.department = req.body.department;
            req.session.telephone = req.body.telephone;
            req.session.email = req.body.email;
            req.session.lineManager = req.body.lineManager;
            res.redirect(`/${path[1]}/${path[2]}/summary-page`);
        } else {
            res.render(`${path[1]}/${path[2]}/application-page`);
        }
    });

    app.get('/proto1/*/summary-page', (req, res) => {
        let path = req.path.split('/');
        res.render(`proto1/${path[2]}/summary-page`, {
            course: req.session.course,
            date: req.session.date,
            location: req.session.location,
            name: req.session.name,
            department: req.session.department,
            telephone: req.session.telephone,
            email: req.session.email,
            lineManager: req.session.lineManager
        });
    });

    app.post('/proto1/return-to-start', (req, res) => {
        req.session.destroy();
        res.redirect('/proto1/gds-academy-apply-start');
    });

    return app;
};
