const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

/**
 * --------------------------------------------------
 * Middleware
 * --------------------------------------------------
 */
app.use(cors());
app.use(express.json());

/**
 * --------------------------------------------------
 * root route
 * --------------------------------------------------
 */

app.get('/', (req, res) => {
    res.send('isp warehouse server running...');
})


/**
 * --------------------------------------------------
 * server listening
 * --------------------------------------------------
 */
app.listen(port, () => {
    console.log(`Server started on port... ${port}`);
})