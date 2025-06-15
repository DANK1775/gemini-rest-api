require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
<<<<<<< HEAD


app.use(express.urlencoded({ extended: true }));
app.use(express.json())

try {
    const { router } = require('./routes')
    app.use(router)
} catch (error) {
    console.log(error)
}
=======
const {router} = require('./routes')

app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(router)
>>>>>>> 6016629a71b8ada54ed6f07ff91dfaa020e3a6f0

app.listen(port, () => console.log(`app listen ${port}`))

