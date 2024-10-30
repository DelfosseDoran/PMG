import express, { Request,Response } from "express";
import db from '../db/db'

const router = express.Router();

router.get('/:search', async function (req:Request, res:Response) {
    const data=await db.select('title').from('article').whereRaw(`match(title,article_discription,article_text) against('${req.params.search}')`)
    res.send(data).status(200)
})


export default router;