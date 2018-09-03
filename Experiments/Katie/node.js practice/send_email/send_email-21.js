var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpass'
  },
  //added tls because it wasnt working, got "self signed certificate" error
  tls:{
    rejectUnauthorized: false
    }
});

var mailOptions = {
  from: 'youremail@gmail.com',
  to: 'receiveremail@iastate.edu',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});