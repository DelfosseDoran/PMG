import express, { Request,Response,NextFunction } from "express";
import path from 'path';

import createError from 'http-errors';

var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');

import usersRouter from './routs/users';
import searchRouter from './routs/search';
import articleRouter from './routs/article';

var app = express();
app.use(cors())
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/search', searchRouter);
app.use('/article', articleRouter);

// catch 404 and forward to error handler
app.use(function( req:Request, res:Response,next:NextFunction) {
  res.status(404).json({ message: 'Route not found' });
});

// error handler
app.use(function(err:any, req:Request, res:Response) {
  // set locals, only providing error in development
  if (!res.locals) res.locals = {};
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.log(err.status)
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
