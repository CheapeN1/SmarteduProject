const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).redirect('/login')
  } catch (error) {
    const errors = validationResult(req);
    console.log(errors);
    console.log(errors.array()[0].msg);
    for (let i = 0; i <errors.array().length; i++) {
      req.flash("error", `${errors.array()[i].msg}`);
    }
  
    res.status(400).redirect('/register');
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "Invalid email or password");
      res.status(400).redirect('/login'); // Eğer kullanıcı bulunamazsa hata döndür
    }

    // Şifre karşılaştırma
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      req.flash("error", "Invalid email or password");
      res.status(400).redirect('/login'); // Eğer şifre eşleşmezse hata döndür
    }
    req.session.userID = user._id;
    // Şifre eşleşirse
    res.status(200).redirect('/users/dashboard');

  } catch (error) {
    // Hata yakalama
    res.status(400).json({
      status: 'fail',
      message: 'Something went wrong',
      error,
    });
  }
};

/* exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    await User.findOne({ email }, (err, user) => {
      if (user) {
       await bcrypt.compare(password, user.password, (err, same) => {
          if (same) {
            // USER SESSION
            res.status(200).send('YOU ARE LOGGED IN');
          }
        });
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
}; */

exports.logoutUser = (req, res) => {
  req.session.destroy(()=> {
    res.redirect('/');
  })
}

exports.getDashboardPage = async (req, res) => {
  const user = await User.findOne({_id:req.session.userID}).populate('courses');
  const categories = await Category.find();
  const courses = await Course.find({user:req.session.userID});
  const users = await User.find();

  console.log(users.countDocument);

  res.status(200).render('dashboard', {
    page_name: 'dashboard',
    user,
    categories,
    courses,
    users
  });
};

exports.deleteUser = async (req, res) => {
  try {    
    await User.findOneAndDelete(req.params.id)
    await Course.deleteMany({user:req.params.id})
    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};