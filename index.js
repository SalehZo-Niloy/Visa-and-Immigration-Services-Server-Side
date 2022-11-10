const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.SECRET_USER}:${process.env.SECRET_PASSWORD}@cluster0.yarpj5v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//----------------------------
// JSON web token verify function
//----------------------------
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
    })
}

const run = async () => {
    try {
        //----------------------------
        // service collection from mongodb
        //----------------------------
        const serviceCollection = client.db('visa-immigration').collection('services');

        //----------------------------
        // review collection from mongodb
        //----------------------------
        const reviewCollection = client.db('visa-immigration').collection('reviews');

        //----------------------------
        // creating a jwt token for user
        //----------------------------
        app.post('/jwt', (req, res) => {
            const user = req.body;

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30d" });
            res.send({ token });
        })

        //----------------------------
        // get api for service in home page
        //----------------------------
        app.get('/homeService', async (req, res) => {
            const query = {};
            const options = {
                sort: { "$natural": -1 }
            };

            const cursor = serviceCollection.find(query, options);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        })

        //----------------------------
        // get api for all services page
        //----------------------------
        app.get('/allServices', async (req, res) => {
            const query = {};
            const options = {
                sort: { "$natural": -1 }
            };

            const cursor = serviceCollection.find(query, options);
            const services = await cursor.toArray();
            res.send(services);
        })

        //----------------------------
        // api for a specific service details
        //----------------------------
        app.get('/serviceDetails/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);

            const query = { _id: ObjectId(id) };

            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //----------------------------
        // api for adding a service
        //----------------------------
        app.post('/service', async (req, res) => {
            const service = req.body;
            // console.log(service);
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        //----------------------------
        // getting review for specific services
        //----------------------------
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { serviceId: id };
            const options = {
                sort: { date: -1 }
            };

            const cursor = reviewCollection.find(query, options);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        //----------------------------
        // getting all review of an user
        //----------------------------
        app.get('/reviews', verifyJWT, async (req, res) => {
            const email = req.query?.email;
            // console.log(email);
            const decoded = req.decoded;
            if (decoded?.email !== email) {
                res.status(403).send({ message: 'Forbidden' });
            }
            const query = { userEmail: email };
            const options = {
                sort: { date: -1 }
            };

            const cursor = reviewCollection.find(query, options);
            const reviews = await cursor.toArray();
            // console.log(reviews);
            res.send(reviews);
        })

        //----------------------------
        // api for specific review
        //----------------------------
        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const review = await reviewCollection.findOne(query);
            res.send(review);
        })

        //----------------------------
        // creating a review
        //----------------------------
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            review.date = new Date().toISOString();
            // console.log(review);
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        //----------------------------
        // deleting a review
        //----------------------------
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };

            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        //----------------------------
        // updating a review
        //----------------------------
        app.patch('/review/:id', async (req, res) => {
            const id = req.params.id;
            const updatedReview = req.body.userReview;
            // console.log(updatedReview, id);

            const query = { _id: ObjectId(id) };

            const updateDoc = {
                $set: { userReview: updatedReview }
            };

            const result = await reviewCollection.updateOne(query, updateDoc);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(e => console.error(e));

app.get('/', (req, res) => {
    res.send('NVIS Running');
})

app.listen(port, () => {
    console.log('NVIS server running on port:', port);
})