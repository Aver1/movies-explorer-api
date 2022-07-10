const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AlreadyExistError = require('../errors/AlreadyExistError');
const NotFoundError = require('../errors/NotFoundError');
const UnAuthorizedError = require('../errors/UnAuthorizedError');
const ValidarionErrror = require('../errors/ValidarionErrror');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidarionErrror('Запрашиваемый пользователь не найден'));
      }
      return next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;
  const userId = req.user._id;

  if (!validator.isEmail(email)) {
    throw new ValidarionErrror('email not correct');
  }

  User.findByIdAndUpdate(userId, { email, name }, { new: true, runValidators: true })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidarionErrror('name are not correct'));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  if (!validator.isEmail(email)) {
    throw new ValidarionErrror('email not correct');
  }

  if (!password) {
    throw new ValidarionErrror('password not correct');
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => res.status(200).send({
      data:
      {
        email: user.email,
        name: user.name,
      },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidarionErrror('name is not correct'));
      }
      if (err.code === 11000) {
        return next(new AlreadyExistError('this Email is already exist'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.status(200).send({ token });
    })
    .catch(() => {
      next(new UnAuthorizedError('Неверные почта или пароль'));
    });
};
