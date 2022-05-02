const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
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
 * Connecting to database
 * --------------------------------------------------
 * Mongo DB
 * --------------------------------------------------
 */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nodedb.scooa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

/**
 * --------------------------------------------------
 * api
 * --------------------------------------------------
 */

async function products() {
    try {
        /**
         * --------------------------------------------------
         * Connect to MongoDB
         * --------------------------------------------------
         */
        await client.connect();
        const productCollection = client.db('ISP-Warehouse').collection('Products');

        /**
         * --------------------------------------------------
         * Get all products
         * --------------------------------------------------
         */

        app.get('/api/products', async (req, res) => {
            const cursor = {};
            const products = await productCollection.find(cursor).toArray();
            res.send(products);
        })
        /**
         * --------------------------------------------------
         * add product
         * --------------------------------------------------
         */

        app.post('/api/products', async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await productCollection.insertOne(product);
            res.send(result);
        })

    }
    finally {
        // client.close();
    }
}

products().catch(console.dir);


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