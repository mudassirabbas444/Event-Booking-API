require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

app.use('/auth', require('./routes/auth'));
app.use('/events', require('./routes/events'));
app.use('/', require('./routes/rsvp'));


app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; 