const User = require('../models/User');
const bcrypt = require('bcrypt');
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      status: 'success',
      user,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send('Invalid email or password'); // Eğer kullanıcı bulunamazsa hata döndür
    }

    // Şifre karşılaştırma
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).send('Invalid email or password'); // Eğer şifre eşleşmezse hata döndür
    }
    req.session.userID = user._id;
    // Şifre eşleşirse
    res.status(200).redirect('/');

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