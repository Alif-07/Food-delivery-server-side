const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
//Middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fmqfn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const database = client.db('FoodDelivery');
		const productsCollection = database.collection('products');
		const orderCollection = database.collection('order');

		//Get products Api
		app.get('/products', async (req, res) => {
			const cursor = productsCollection.find({});
			const products = await cursor.toArray();
			res.send(products);
		});
		//Get api order
		app.get('/orders', async (req, res) => {
			const cursor = orderCollection.find({});
			const orders = await cursor.toArray();
			res.send(orders);
		});
		//Get single order
		app.get('/orders/:id', async (req, res) => {
			const id = req.params.id;
			console.log('getting', id);
			const query = { _id: ObjectId(id) };
			const service = await orderCollection.findOne(query);
			res.json(service);
		});
		//PUT api
		app.put('/orders/:id', async (req, res) => {
			const id = req.params.id;
			const updatedUser = req.body;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					foodName: updatedUser.foodName,
					quantity: updatedUser.quantity,
					address: updatedUser.address,
				},
			};
			const result = await orderCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			console.log('update', id);
			res.json(result);
		});
		//Post api orders
		app.post('/orders', async (req, res) => {
			const order = req.body;
			console.log('hit the post', order);
			const result = await orderCollection.insertOne(order);
			res.json(result);
		});
		//Delete api
		app.delete('/orders/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await orderCollection.deleteOne(query);
			res.json(result);
		});
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);
app.get('/', (req, res) => {
	res.send('My server');
});

app.listen(port, () => {
	console.log('Running on port', port);
});
