const express = require('express');
const router = express.Router()
const { ask } = require('./gemini')

try {
    router.get('/', async (req, res) => {
        let data = {
            info: 'Esta es una simple api de IA',
            author: 'GH: DANK1775 | DC: dank.js'
        }
        res.json(data)
    })
    router.get('/api', async (req, res) => {
        if (req.query.prompt) {
            const iaRes = await ask(req.query.prompt.toString())
            let data = {
                request: req.query.prompt,
                response: iaRes
            }
            res.json(data)
        } else {
            const dataa = 'ocurrio un error'
            res.json(dataa)
        }
    })
} catch (error) {
    console.log(error)
}


module.exports = {
    router
}