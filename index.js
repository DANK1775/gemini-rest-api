require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

try {
    const { router } = require('./routes')
    app.use(router)
} catch (error) {
    console.log(error)
}

app.listen(port, () => console.log(`app listen ${port}`))

