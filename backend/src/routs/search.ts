import express, { NextFunction, Request,Response } from "express";
import db from '../db/db'
import HttpError from "../types/error";
const router = express.Router();

/* GET users listing. */
router.get('/:id.:text?', async function (req:Request, res:Response,next:NextFunction) {
    if(!req.params.id)
    {const err=new HttpError('not loged in', 401);
        next(err)
    return}
    try{
    if (req.params.text) {
        const dataMostSuccesFull =
            await db.select('*')
                .from(('popular_search_query'))
                .where('search_query', 'like', `${req.params.text}%`)
                .orderBy('amount_of_hits', 'desc')
                .limit(4)
        const dataOwnSearches =
            await db.select('*')
                .from(('user_search_query'))
                .where('search_query', 'like', `${req.params.text}%`)
                .where('user_id', req.params.id)
                .orderBy('searched_at', 'desc')
                .limit(4)
        res.send({ dataMostSuccesFull, dataOwnSearches })
    }
    else {
        const dataMostSuccesFull =
            await db.select('*')
                .from(('popular_search_query'))
                .orderBy('amount_of_hits', 'desc')
                .limit(4)
        const dataOwnSearches =
            await db.select('*')
                .from(('user_search_query'))
                .where('user_id', req.params.id)
                .orderBy('searched_at', 'desc')
                .limit(4)
        res.send({ dataMostSuccesFull, dataOwnSearches })
    }
}
    catch{
        const err=new HttpError('could not make user', 400);
        next(err)
    }
});

router.post('/', async function (req:Request, res:Response) {
    const search = await db.select('*').from('popular_search_query').where('search_query', req.body.search).first()
    if (search) {
        await db('popular_search_query').where('id', search.id).update('amount_of_hits', search.amount_of_hits + 1)
    }
    else {
        await db('popular_search_query').insert({
            'search_query': req.body.search
        })
    }
    const personalSearch =
        await db.select('*')
            .from('user_search_query')
            .where('search_query', req.body.search)
            .andWhere('user_id', req.body.user_Id)
            .first()
    if (personalSearch) {
        await db('user_search_query').where('id', personalSearch.id).update('searched_at', new Date(Date.now()))
    }
    else
        await db('user_search_query').insert({
            'search_query': req.body.search, user_id: req.body.user_Id
        })
    res.send()
})

export default router;