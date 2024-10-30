import express, { Request,Response,NextFunction } from "express";
const router = express.Router();
import db from '../db/db'
import HttpError from '../types/error'



/* GET users listing. */
router.get('/id/:name', async function (req:Request, res:Response,next:NextFunction) {
  const data = await db.select('id').from('users').where('name', req.params.name).first()
  if (data)
  res.send(data)
else {
    const err = new HttpError('User not found', 400); // Use custom error class
    next(err); // Pass the error to the error-handling middleware
  }}
);

router.post('/',async function(req:Request, res:Response,next:NextFunction) {
  const data = await db.select('id').from('users').where('name', req.body.name).first()
  if (!data)
    {
      await db('users').insert({'name':req.body.name})
      const newUser = await db.select('id').from('users').where('name', req.body.name).first()
  res.send(newUser)
  }
  else{
    const err = new HttpError('could not make user', 400); // Use custom error class
    next(err); // Pass the error to the error-handling middleware
  }
})

export default router;
