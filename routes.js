const express = require('express');
const router = express.Router()
const {ask} = require('./gemini')

router.get('/', async (req, res) => {
    let data = {
        info: 'este es un simple proyevto'
    }

    res.json(data)
})
router.get('/api', async (req, res) => {
    if(req.query.prompt) {
        const iaRes = await ask(req.query.prompt.toString())
        let data = {
            request: req.query.prompt,
            response: iaRes
        }
        res.json(data)
    } else {
        const dataa =  'ocurrio un error'
        res.json(dataa)
    }
})

module.exports = {
    router
}