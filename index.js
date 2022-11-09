const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.SECRET_USER}:${process.env.SECRET_PASSWORD}@cluster0.yarpj5v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const serviceCollection = client.db('visa-immigration').collection('services');

        const reviewCollection = client.db('visa-immigration').collection('reviews');

        app.get('/homeService', async (req, res) => {
            const query = {};

            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        })

        app.get('/allServices', async (req, res) => {
            const query = {};

            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/serviceDetails/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);

            const query = { _id: ObjectId(id) };

            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { serviceId: id };
            const options = {};

            const cursor = reviewCollection.find(query, options);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            // console.log(review);
            const result = await reviewCollection.insertOne(review);
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