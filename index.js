const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 8844
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())







const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.oypj9vn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    let usersCollection = client.db('petoriaDB').collection('users')
    let petsCollection = client.db('petoriaDB').collection('pets')
    let campaignCollection = client.db('petoriaDB').collection('campaign')

    // app.post('/users',async(req,res)=>{
    //     let user = req.body 
    //     console.log(user);
    //     let result= await usersCollection.insertOne(user)
    //     res.send(result)
    // })

    app.get('/users', async (req, res) => {
      let result = await usersCollection.find().toArray();
      res.send(result)

    })

    app.post('/users', async (req, res) => {
      const user = req.body
      // console.log(user.email);
      let query = { email: user?.email }
      let existingUser = await usersCollection.findOne(query)
      // console.log(user.email);
      // console.log(existingUser);
      if (existingUser) {
        return res.send({ message: 'already have an account', insertedId: null })
      }
      // console.log(user);
      const result = await usersCollection.insertOne(user)
      res.send(result)

    })

    // pet related

    app.get('/allpets', async (req, res) => {
      let result = await petsCollection.find().toArray()
      res.send(result)
    })

    app.get('/onepet/:id', async (req, res) => {
      let id = req.params.id
      let query = { _id: new ObjectId(id) }
      let result = await petsCollection.findOne(query)
      res.send(result)
    })

    app.post('/pets', async (req, res) => {
      let pet = req.body
      let result = await petsCollection.insertOne(pet)
      res.send(result)
    })

    app.delete('/petdelete/:id', async (req, res) => {
      let id = req.params.id
      let query = { _id: new ObjectId(id) }
      let result = await petsCollection.deleteOne(query)
      res.send(result)
    })

    app.patch('/petstatusbyadmin/:id', async (req, res) => {
      let pet = req.body
      let id = req.params.id
      let query = { _id: new ObjectId(id) }
      let updatedDoc = {
        $set: {
          adopted: pet.adopted
        }
      }

      let result = await petsCollection.updateOne(query, updatedDoc)
      res.send(result)
    })


    // pet listing

    app.get('/petlisting',async(req,res)=>{
      // let email=req.params.email 

      let result= await petsCollection.aggregate([
        {
          $match:{adopted:false}
        }
      ]).toArray();
      res.send(result)
    })



    // campaign related
    app.post('/createcampaign', async (req, res) => {
      let pet = req.body
      let result = await campaignCollection.insertOne(pet)
      res.send(result)
    })


    app.get('/campaigns', async (req, res) => {
      let result = await campaignCollection.find().toArray();
      res.send(result)
    })

    app.get('/alldonationsbyadmincampaign', async (req, res) => {
      let result = await campaignCollection.find().toArray();
      res.send(result)
    })

    app.get('/onedonation/:id', async (req, res) => {
      let id = req.params.id
      let query = { _id: new ObjectId(id) }
      let result = await campaignCollection.findOne(query)
      res.send(result)
    })

    app.put('/campaignspause/:id', async (req, res) => {
      let id = req.params.id
      let campaign = req.body
      let query = { _id: new ObjectId(id) }
      let options = { upsert: true }
      let updatedDoc = {
        $set: {
          isPaused: campaign.isPaused
        }
      }

      let result = await campaignCollection.updateOne(query, updatedDoc, options)
      res.send(result)
    })



    app.put('/editdonation/:id', async (req, res) => {
      let id = req.params.id
      let campaign = req.body
      let query = { _id: new ObjectId(id) }
      let options = { upsert: true }
      let updatedDoc = {
        $set: {
          name: campaign.name,
          image: campaign.image,
          maximumDonation: campaign.maximumDonation,
          shortDescription: campaign.shortDescription,
          longDescription: campaign.longDescription,
          lastDate: campaign.lastDate

        }
      }

      let result = await campaignCollection.updateOne(query, updatedDoc, options)
      res.send(result)
    })

    // admin related

    app.patch('/makeadmin/:id', async (req, res) => {
      let id = req.params.id
      let user = req.body
      let query = { _id: new ObjectId(id) }
      // let options = { upsert: true }
      let updatedDoc = {
        $set: {
          role: user.role
        }
      }

      let result = await usersCollection.updateOne(query, updatedDoc)
      res.send(result)
    })



    app.delete('/campaigndeletebyadmin/:id', async (req, res) => {
      let id = req.params.id
      let query = { _id: new ObjectId(id) }
      let result = await campaignCollection.deleteOne(query)
      res.send(result)
    })


    app.put('/updatepet/:id', async (req, res) => {
      let id = req.params.id
      let pet = req.body
      let filter = { _id: new ObjectId(id) }
      // let options = { upsert: true }
      let updatedDoc = {
        $set: {
          image: pet.image,
          date: pet.data,
          time: pet.date,
          name: pet.name,
          age: pet.age,
          location: pet.location,
          category: pet.category,
          shortDescription: pet.shortDescription,
          longDescription: pet.longDescription
        }
      }

      let result=await petsCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('SERVER IS RUNNING')
})

app.listen(port, (req, res) => {
  console.log(`server in PORT:${port}`);
})
