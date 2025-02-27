var express = require('express');
var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var validator = require('express-validator');
var request = require('request');
var EventEmitter = require("events").EventEmitter;
const config = require('../config.json');
const urlapi = config.url;
const imagepath = config.imagepath;
const base = config.base;
const baseurl = config.url;
const front = config.front;
const session = require('express-session');
const fs = require("fs");
const multer = require('multer');
const csv = require('csv-parser');
var body = new EventEmitter();
const upload = multer({ dest: 'uploads/' });
const csvtojson = require('csvtojson');
const { json } = require('body-parser');

module.exports = function (app) {
    // Session middleware setup
    app.use(session({
      secret: 'Lifora-Session-2025',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false } // Set to true if using HTTPS
  }));

  // Middleware to make totaldata and other locals available in all views
  app.use((req, res, next) => {
      res.locals.totaldata = req.session.totaldata || {};
      res.locals.urlapi = urlapi;
      res.locals.base = base;
      res.locals.front = front;
      res.locals.translation = {
          Main: 'Main',
          Dashboard: 'Dashboard'
      };
      next();
  });

    function isUserAllowed(req, res, next) {
        sess = req.session;
        if (sess.user) {
            
            var optionsuser = {
              'method': 'GET',
              'url': urlapi + 'dashtotalcount',
              'headers': {
                  'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
              }
          };
          
          console.log(optionsuser);
          request(optionsuser, function (error, responsed) {
              if (error) {
                  console.error('Error fetching totalcount:', error);
                  return res.status(500).send('Error fetching dashboard data');
              }
              
              var responsedatad = JSON.parse(responsed.body);
                
                // Save to session storage
                req.session.totaldata = responsedatad;  
              
                
                return next();
          });
              
          
        } else {
          var optionsuser = {
            'method': 'GET',
            'url': urlapi + 'dashtotalcount',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        
        console.log(optionsuser);
        request(optionsuser, function (error, responsed) {
            if (error) {
                console.error('Error fetching totalcount:', error);
                return res.status(500).send('Error fetching dashboard data');
            }
            
            var responsedatad = JSON.parse(responsed.body);
              
              // Save to session storage
              req.session.totaldata = responsedatad;
            
              
            res.redirect(base + '/login');
        });
            
        }
    }

    app.post(base + '/importuser', upload.single('file'), function (req, res) {
        var fileName = req.file.path;
        var csvData = [];
        fs.createReadStream(fileName)
            .pipe(csv({ delimiter: ':' }))
            .on('data', function (csvrow) {
                csvData.push(csvrow);
            })
            .on('end', function () {
                var options = {
                    'method': 'POST',
                    'url': urlapi + 'importuser',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Cookie': 'refreshToken=f29c019c3f1654b1d5a4ae04fd610b5f41711384e56809ee2e5ef4bd0ccc497c919bef0998a8c3d4'
                    },
                    body: JSON.stringify(csvData)
                };
                request(options, function (error, response) {
                    if (error) throw new Error(error);
                    var data = JSON.parse(response.body);
                    req.flash('message', data.message);
                    res.redirect(base + '/users');
                });
            });
    });

    // Dashboard route
    app.get(base, isUserAllowed, function (req, res) {
        var optionsuser = {
            'method': 'GET',
            'url': urlapi + 'dashtotalcount',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        
        console.log(optionsuser);
        request(optionsuser, function (error, responsed) {
            if (error) {
                console.error('Error fetching totalcount:', error);
                return res.status(500).send('Error fetching dashboard data');
            }
            
            var responsedatad = JSON.parse(responsed.body);
              
              // Save to session storage
              req.session.totaldata = responsedatad;
            
            res.locals.title = 'Dashboard';
            res.render('Dashboard/index');
        });
    });

    app.get(base + '/adduser', isUserAllowed, function (req, res) {
        res.locals.title = 'Add User';
        res.render('Users/adduser');
    });

    app.get(base + '/updateuser', isUserAllowed, function (req, res) {
        var id = req.query.id;
        var options = {
            'method': 'GET',
            'url': urlapi + 'getuser/' + id,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        
        request(options, function (error, response) {
            var responsedata = JSON.parse(response.body);
            res.locals.title = 'Update User';
            res.locals.users = responsedata;
            res.locals.id = id;
            res.locals.imagepath = imagepath;
            res.render('Users/updateuser');
        });
    });

    app.get(base + '/users', isUserAllowed, function (req, res) {
        res.locals.title = 'User List';
        res.locals.imagepath = imagepath;
        res.render('Users/index');
    });

    app.get(base + '/addbanner', isUserAllowed, function (req, res) {
        res.locals.title = 'Add Banner';
        res.render('Banner/addbanner');
    });

    app.get(base + '/editcontact', isUserAllowed, function (req, res) {
        var id = req.query.id;
        var optionstest = {
            'method': 'GET',
            'url': urlapi + 'getcontactbyid/' + id,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };

        request(optionstest, function (error, responsetest) {
            if (error) throw new Error(error);
            var responsetest = JSON.parse(responsetest.body);
            res.locals.title = 'Update Contact';
            res.locals.id = id;
            res.locals.responsetest = responsetest;
            res.render('Cms/editcontact');
        });
    });

    app.get(base + '/editcms', isUserAllowed, function (req, res) {
        var id = req.query.id;
        var optionstest = {
            'method': 'GET',
            'url': urlapi + 'getcmsbyid/' + id,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };

        request(optionstest, function (error, responsetest) {
            if (error) throw new Error(error);
            var responsetest = JSON.parse(responsetest.body);
            res.locals.title = 'Cms';
            res.locals.id = id;
            res.locals.responsetest = responsetest;
            res.render('Cms/editcms');
        });
    });

    app.get(base + '/editfaq', isUserAllowed, function (req, res) {
        var id = req.query.id;
        var optionstest = {
            'method': 'GET',
            'url': urlapi + 'getfaqbyid/' + id,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };

        request(optionstest, function (error, responsetest) {
            if (error) throw new Error(error);
            var responsetest = JSON.parse(responsetest.body);
            res.locals.title = 'Update Faq';
            res.locals.id = id;
            res.locals.responsetest = responsetest;
            res.render('Cms/editfaq');
        });
    });

    app.get(base + '/addcontact', isUserAllowed, function (req, res) {
        res.locals.title = 'Add Contact';
        res.render('Cms/addcontact');
    });

    app.get(base + '/addcms', isUserAllowed, function (req, res) {
        res.locals.title = 'Cms';
        res.render('Cms/addcms');
    });

    app.get(base + '/addfaq', isUserAllowed, function (req, res) {
        res.locals.title = 'Add Faq';
        res.render('Cms/addfaq');
    });

    app.get(base + '/updatebanner', isUserAllowed, function (req, res) {
        var id = req.query.id;
        var options = {
            'method': 'GET',
            'url': urlapi + 'getbannerbyid/' + id,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        
        request(options, function (error, response) {
            if (error) throw new Error(error);
            var responsedata = JSON.parse(response.body);
            res.locals.title = 'Update Banner';
            res.locals.banner = responsedata;
            res.locals.id = id;
            res.locals.imagepath = imagepath;
            res.render('Banner/editbanner');
        });
    });

    app.get(base + '/contact', isUserAllowed, function (req, res) {
        var optionscategory = {
            'method': 'GET',
            'url': urlapi + 'getallcontactadmin',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        request(optionscategory, function (error, response) {
            if (error) throw new Error(error);
            var responsedata = JSON.parse(response.body);
            res.locals.title = 'Contact';
            res.locals.contact = responsedata;
            res.render('Cms/contact');
        });
    });

    app.get(base + '/faq', isUserAllowed, function (req, res) {
        var optionscategory = {
            'method': 'GET',
            'url': urlapi + 'faq',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        request(optionscategory, function (error, response) {
            if (error) throw new Error(error);
            var responsedata = JSON.parse(response.body);
            res.locals.title = 'Faq';
            res.locals.faq = responsedata;
            res.render('Cms/faq');
        });
    });

    app.get(base + '/edit-questionnaire/:id', isUserAllowed, function (req, res) {
        const questionnaireId = req.params.id;
        var options = {
            'method': 'GET',
            'url': urlapi + `getquestionnaire/${questionnaireId}`,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };

        request(options, function (error, response) {
            if (error) {
                console.error('Error fetching questionnaire:', error);
                return res.status(500).send('Failed to fetch questionnaire');
            }
            var responsedata = JSON.parse(response.body);
            if (!responsedata.questionnaire) {
                return res.status(404).send('Questionnaire not found');
            }
            res.locals.title = 'Edit Questionnaire';
            res.locals.questionnaire = responsedata.questionnaire;
            res.render('Cms/edit-questionnaire');
        });
    });

    app.get(base + '/add-questionnaire', isUserAllowed, function (req, res) {
        res.locals.title = 'Add Questionnaire';
        res.render('Cms/addquestionnaire');
    });

    app.get(base + '/questionnaires', isUserAllowed, function (req, res) {
        var options = {
            'method': 'GET',
            'url': `${baseurl}getallquestionnaires`,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };

        request(options, function (error, response) {
            if (error) {
                console.error('Error fetching questionnaires:', error);
                return res.status(500).send('Error fetching data');
            }
            var responsedata = JSON.parse(response.body);
            res.locals.title = 'Questionnaires';
            res.locals.questionnaires = responsedata.questionnaires;
            res.render('Cms/questionnaires');
        });
    });

    app.get(base + '/cms', isUserAllowed, function (req, res) {
        res.locals.title = 'CMS List';
        res.render('Cms/cms');
    });

    app.get(base + '/products', isUserAllowed, function (req, res) {
        res.locals.title = 'Products List';
        res.render('products/products');
    });

    app.get(base + '/addproduct', isUserAllowed, function (req, res) {
        res.locals.title = 'Add Product';
        res.render('products/addproduct');
    });

    app.get(base + '/notifications', isUserAllowed, function (req, res) {
        res.locals.title = 'Notifications Sender';
        res.render('notifications/notification');
    });

    app.get(base + '/orders', isUserAllowed, function (req, res) {
        res.locals.title = 'Orders List';
        res.render('Orders/order');
    });

    app.get(base + '/editproduct', isUserAllowed, function (req, res) {
        res.locals.title = 'Edit Product';
        res.render('products/editproduct');
    });

    app.get(base + '/banner', isUserAllowed, function (req, res) {
        res.locals.title = 'Banner';
        res.locals.imagepath = imagepath;
        res.render('Banner/index');
    });

    app.get(base + '/formations', isUserAllowed, function (req, res) {
        res.locals.title = 'Formations';
        res.locals.imagepath = imagepath;
        res.render('Formations/index');
    });

    app.get(base + '/blog', isUserAllowed, function (req, res) {
        res.locals.title = 'Blog';
        res.locals.imagepath = imagepath;
        res.render('blog/index');
    });

    app.get(base + '/addformation', isUserAllowed, function (req, res) {
        var optionscategory = {
            'method': 'GET',
            'url': urlapi + 'blogcategory',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        var optionsuser = {
            'method': 'GET',
            'url': urlapi + 'getallformations',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        
        request(optionscategory, function (error, responsed) {
            request(optionsuser, function (error, responsedd) {
                if (error) throw new Error(error);
                var categorydata = JSON.parse(responsed.body);
                var userdata = JSON.parse(responsedd.body);
                console.log("user data : ", userdata);
                console.log("categorys data : ", categorydata);
                res.locals.title = 'Add Formation';
                res.locals.categorydata = categorydata;
                res.locals.userdata = userdata;
                res.render('Formations/addFormation');
            });
        });
    });

    app.get(base + '/addblog', isUserAllowed, function (req, res) {
        var optionscategory = {
            'method': 'GET',
            'url': urlapi + 'blogcategory',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        var optionsuser = {
            'method': 'GET',
            'url': urlapi + 'getAllusersfront',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        request(optionscategory, function (error, responsed) {
            request(optionsuser, function (error, responsedd) {
                if (error) throw new Error(error);
                var categorydata = JSON.parse(responsed.body);
                var userdata = JSON.parse(responsedd.body);
                res.locals.title = 'Add Blog';
                res.locals.categorydata = categorydata;
                res.locals.userdata = userdata;
                res.render('blog/addblog');
            });
        });
    });

    app.get(base + '/editFormation', isUserAllowed, function (req, res) {
        var id = req.query.id;
        var formation = {
            'method': 'GET',
            'url': urlapi + '/getformation/' + id,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        var optionscategory = {
            'method': 'GET',
            'url': urlapi + 'blogcategory',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        var optionsuser = {
            'method': 'GET',
            'url': urlapi + 'getAllusersfront',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };

        request(formation, function (error, responsed) {
            request(optionscategory, function (error, responsedd) {
                request(optionsuser, function (error, responseuser) {
                    if (error) throw new Error(error);
                    var formation = JSON.parse(responsed.body);
                    var categorydata = JSON.parse(responsedd.body);
                    var userdata = JSON.parse(responseuser.body);
                    res.locals.title = 'Edit Formation';
                    res.locals.formation = formation;
                    res.locals.id = id;
                    res.locals.categorydata = categorydata;
                    res.locals.userdata = userdata;
                    res.locals.imagepath = imagepath;
                    res.render('Formations/editFormation');
                });
            });
        });
    });

    app.get(base + '/editblog', isUserAllowed, function (req, res) {
        var id = req.query.id;
        var optionsblog = {
            'method': 'GET',
            'url': urlapi + 'getblogbyid/' + id,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        var optionscategory = {
            'method': 'GET',
            'url': urlapi + 'blogcategory',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        var optionsuser = {
            'method': 'GET',
            'url': urlapi + 'getAllusersfront',
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };

        request(optionsblog, function (error, responsed) {
            request(optionscategory, function (error, responsedd) {
                request(optionsuser, function (error, responseuser) {
                    if (error) throw new Error(error);
                    var blog = JSON.parse(responsed.body);
                    var categorydata = JSON.parse(responsedd.body);
                    var userdata = JSON.parse(responseuser.body);
                    res.locals.title = 'Edit Blog';
                    res.locals.blog = blog;
                    res.locals.id = id;
                    res.locals.categorydata = categorydata;
                    res.locals.userdata = userdata;
                    res.locals.imagepath = imagepath;
                    res.render('blog/editblog');
                });
            });
        });
    });

    app.get(base + '/manageblogcategory', isUserAllowed, function (req, res) {
        res.locals.title = 'Manage Blog Category';
        res.render('blog/manageblogcategory');
    });

    app.get(base + '/addblogcategory', isUserAllowed, function (req, res) {
        res.locals.title = 'Add Blog Category';
        res.render('blog/addblogcategory');
    });

    app.get(base + '/editblogcategory', isUserAllowed, function (req, res) {
        var id = req.query.id;
        var options = {
            'method': 'GET',
            'url': urlapi + 'blogcategorybyid/' + id,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            var catdata = JSON.parse(response.body);
            console.log(catdata[0].txt_catname);
            res.locals.title = 'Edit Blog Category';
            res.locals.catdata = catdata;
            res.locals.id = id;
            res.render('blog/updateblogcategory');
        });
    });

    app.get(base + '/changepassword', isUserAllowed, function (req, res) {
        res.locals.title = 'Change Password';
        res.locals.imagepath = imagepath;
        res.render('admin/changepassword');
    });

    app.get(base + '/administrator', isUserAllowed, function (req, res) {
        res.locals.title = 'Administrator List';
        res.locals.imagepath = imagepath;
        res.render('admin/administrator');
    });

    app.get(base + '/editadministrator', isUserAllowed, function (req, res) {
        id = req.query.id;
        var options = {
            'method': 'GET',
            'url': urlapi + 'getadmindata/' + id,
            'headers': {
                'Cookie': 'refreshToken=4d981ea4c28df051ba99fcc2ea0a6c7719f0da5c4a454cdc074eba0604dff324184673185db67ecd'
            }
        };
        request(options, function (error, response) {
            var admindata = JSON.parse(response.body);
            res.locals.title = 'Administrator Information';
            res.locals.imagepath = imagepath;
            res.locals.admin = admindata;
            res.render('admin/editadministrator');
        });
    });
};