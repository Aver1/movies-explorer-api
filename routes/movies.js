const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const regExp = require('../utils/regExp');

const {
  createMovie,
  getMovies,
  deleteMovie,
} = require('../controllers/movies');

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(regExp),
    trailerLink: Joi.string().required().pattern(regExp),
    thumbnail: Joi.string().required().pattern(regExp),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    movieId: Joi.number().required(),
  }),
}), createMovie);
router.get('/', getMovies);
router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex().required(),
  }),
}), deleteMovie);

module.exports = router;
