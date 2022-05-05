const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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
 * JWT token middleware
 * --------------------------------------------------
 */

function verifyJWT(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
        return res.status(401).send({ message: 'unauthorized access' });
    } else {
        const token = auth.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(403).send({ message: 'Forbidden access' });
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    };
};

/**
 * --------------------------------------------------
 * Config database
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
        * root route
        * --------------------------------------------------
        */

        app.get('/', (req, res) => {
            res.send('isp warehouse server running...');
        });

        /**
         * --------------------------------------------------
         * jwt token
         * --------------------------------------------------
         */

        app.post('/api/login', (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
                expiresIn: '5m'
            });
            res.send({ accessToken });

        });

        /**
         * --------------------------------------------------
         * Get all products
         * --------------------------------------------------
         */

        app.get('/api/products', verifyJWT, async (req, res) => {
            const query = req.query;
            const cursor = query ? query : {};
            const products = await productCollection.find(cursor).toArray();
            res.send(products);
        });

        /**
         * --------------------------------------------------
         * fetch latest product
         * --------------------------------------------------
         */

        app.get('/api/products/latest', async (req, res) => {
            const products = await productCollection.find().sort({ _id: -1 }).limit(1).toArray();
            res.send(products);
        })

        /**
         * --------------------------------------------------
         * get product by id
         * --------------------------------------------------
         */

        app.get('/api/products/:id', async (req, res) => {
            const id = req.params.id;
            const product = await productCollection.findOne({ _id: ObjectId(id) });
            res.send(product);
        });

        /**
         * --------------------------------------------------
         * add product
         * --------------------------------------------------
         */

        app.post('/api/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });

        /**
         * --------------------------------------------------
         * shipped a product single or multiple
         * --------------------------------------------------
         */

        app.put('/api/products/shipped/:id', async (req, res) => {
            const id = req.params.id;
            const qtn = req.body.quantity;
            const product = await productCollection.findOne({ _id: ObjectId(id) });
            if (product) {
                const quantity = qtn ? parseInt(product.quantity) - parseInt(qtn) : parseInt(product.quantity) - 1;
                const result = await productCollection.updateOne({ _id: ObjectId(id) }, { $set: { quantity: quantity } });
                res.send(result);
            }
            else {
                res.send('product not found');
            }
        });

        /**
         * --------------------------------------------------
         * update stock
         * --------------------------------------------------
         */

        app.put('/api/product/stock/:id', async (req, res) => {
            const id = req.params.id;
            const qtn = req.body.quantity;
            const product = await productCollection.findOne({ _id: ObjectId(id) });
            if (product) {
                const quantity = parseInt(product.quantity) + parseInt(qtn);
                const result = await productCollection.updateOne({ _id: ObjectId(id) }, { $set: { quantity: quantity } });
                res.send(result);
            }
        });

        /**
         * --------------------------------------------------
         * delete product
         * --------------------------------------------------
         */
        app.delete('/api/products/:id', async (req, res) => {
            const product = req.params.id;
            const result = await productCollection.deleteOne({ _id: ObjectId(product) });
            res.send(result);

        });

    }
    finally {
        /**
         * --------------------------------------------------
         * disconnect from MongoDB
         * --------------------------------------------------
         */
        // client.close();
    }
};

products().catch(console.dir);




/**
 * --------------------------------------------------
 * server listening
 * --------------------------------------------------
 */
app.listen(port, () => {
    console.log(`Server started on port... ${port}`);
});