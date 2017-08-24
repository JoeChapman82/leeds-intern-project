const rp = require('request-promise');
const months = ['Janruary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const notify = require('../../../services/notify');

function padNum(num, size) {
    var s = "0000" + num;
    return s.substr(s.length - size);
}
// worst routes ever
module.exports = (app) => {

    app.post('/proto1/agile-awareness/digital-and-agile-awareness-course', [
        (req, res) => {
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
    }]);

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

    app.get('/proto1/*/select-your-course', [
        (req, res, next) => {
            let path = req.path.split('/');
            rp({
                method: 'GET',
                uri: `${process.env.API_URI}courses/${path[2]}`,
                simple: false,
            })
            .then((response) => {
                res.locals.apiResponse = JSON.parse(response);
                res.locals.apiResponse.forEach((r) => {
                    let sd = new Date(r.startDate);
                    let ed = new Date(r.endDate);
                    r.displaySmall = `${padNum(sd.getDate(), 2)} ${months[sd.getMonth()]}`;
                    r.displayText = `${padNum(sd.getDate(), 2)} ${months[sd.getMonth()]} to ${padNum(ed.getDate(), 2)} ${months[ed.getMonth()]} ${ed.getFullYear()}`;
                    r.spacesText = r.isFull ? 'Course full' : `${r.maximum - r.attendee.length} spaces left`;
                });
                res.render(`${path[1]}/${path[2]}/select-your-course`);
            });
        }
    ]);


    app.post('/proto1/*/select-your-course', [
        (req, res, next) => {
            let path = req.path.split('/');
            rp({
                method: 'GET',
                uri: `${process.env.API_URI}courses/${path[2]}`,
                simple: false,
            })
            .then((response) => {
                res.locals.apiResponse = JSON.parse(response);
                res.locals.apiResponse.forEach((r) => {
                    let sd = new Date(r.startDate);
                    let ed = new Date(r.endDate);
                    r.displaySmall = `${padNum(sd.getDate(), 2)} ${months[sd.getMonth()]}`;
                    r.displayText = `${padNum(sd.getDate(), 2)} ${months[sd.getMonth()]} to ${padNum(ed.getDate(), 2)} ${months[ed.getMonth()]} ${ed.getFullYear()}`;
                    r.spacesText = r.isFull ? 'Course full' : `${r.maximum - r.attendee.length} spaces left`;
                });
                next();
            });
        },
        (req, res) => {
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
            let bo = Object.keys(req.body)[0];
            req.session.courseId = bo;
            req.session.course = req.body[bo];
            req.session.date = req.body[bo].substring(req.body[bo].indexOf(' ') + 1);
            req.session.startDate = req.body[bo].substring(req.body[bo].indexOf(' ') + 1, req.body[bo].indexOf('to '));
            req.session.endDate = req.body[bo].substring(req.body[bo].indexOf('to ') + 3, req.body[bo].length -5);
            req.session.location = req.body[bo].substring(0, req.body[bo].indexOf(' '));
            res.redirect(`/${path[1]}/${path[2]}/application-page`);
        }
    }]);

    app.get('/proto1/*/application-page', (req, res) => {
        let path = req.path.split('/');
        res.render(`proto1/${path[2]}/application-page`, {
            course: req.session.course,
            location: req.session.location,
            startDate: req.session.startDate,
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
            startDate: req.session.startDate,
            endDate: req.session.endDate,
            location: req.session.location,
            name: req.session.name,
            department: req.session.department,
            telephone: req.session.telephone,
            email: req.session.email,
            lineManager: req.session.lineManager,
            courseId: req.session.courseId
        });
    });

    app.post('/proto1/*/summary-page', [(req, res, next) => {
        let path = req.path.split('/');
        rp({
            method: 'POST',
            uri: `${process.env.API_URI}addAttendee`,
            simple: false,
            form: {
                id: req.session.courseId,
                attendee: req.session.email
            }
        })
        .then((response) => {
            // console.log(response);
            next();
        });
    },
    (req, res, next) => {
        // notify bit
        if(req.session.email) {
            let path = req.path.split('/');
            let template = path[2] === 'agile-awareness' ? '3754b9bb-a377-4bce-a37e-b0aec9f51be0' : '7fe25ea2-5e9e-4243-8fde-d398ae9600d1';
            let email = req.session.email;
            notify.sendEmail(template, email)
            .then((response) => {
                next();
            })
            .catch((error) => {
                console.log(error);
            });
        } else { // don't bother with notify if req.sesion isn't there
            next();
        }
    },
    (req, res, next) => {
        let path = req.path.split('/');
        res.redirect(`/proto1/${path[2]}/holding-response`);
    }
]);

    app.post('/proto1/return-to-start', (req, res) => {
        req.session.destroy();
        res.redirect('/proto1/gds-academy-apply-start');
    });

    return app;
};
