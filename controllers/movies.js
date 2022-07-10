const Movie = require('../models/movie');
const ValidarionErrror = require('../errors/ValidarionErrror');
const NotFoundError = require('../errors/NotFoundError');
const PermissionError = require('../errors/PermissionError');

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const userId = req.user._id;

  if (!country || !director || !duration || !year || !description
    || !image || !trailerLink || !nameRU || !nameEN || !thumbnail || !movieId) {
    throw new ValidarionErrror('something is not correct');
  }

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: userId,
  })
    .then((movie) => res.status(200).send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.send(err);
        return next(new ValidarionErrror('something is not correct'));
      }
      return next(err);
    });
};

module.exports.getMovies = (req, res, next) => {
  const userId = req.user._id;

  Movie.find({ owner: userId })
    .then((movie) => {
      if (movie.length === 0) {
        throw new NotFoundError('У вас нет сохраненных фильмов.');
      }
      res.status(200).send({ data: movie });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.send(err);
        return next(new ValidarionErrror('something is not correct'));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const userId = req.user._id;
  const { movieId } = req.params;

  if (movieId.length !== 24) {
    throw new ValidarionErrror('Переданы некорректные данные.');
  }

  Movie.findById(movieId)
    .orFail(() => {
      throw new NotFoundError('Фильм с указанным id не найден.');
    })
    .then((movie) => {
      if (!movie.owner.equals(userId)) {
        throw new PermissionError('У вас нет прав на это действие.');
      }
      return movie.remove().then(() => res.status(200).send({ data: movie }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidarionErrror('Указан некорректный id.'));
      }
      return next(err);
    });
};
