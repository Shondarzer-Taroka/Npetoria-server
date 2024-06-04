const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 8844
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
    let adoptionsrequestedCollection = client.db('petoriaDB').collection('adoptionsrequested')
    let donatorsCollection = client.db('petoriaDB').collection('donators')

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

    app.get('/myaddedpets/:email', async (req, res) => {
      let email = req.params.email
      let query = { email: email }
      let result = await petsCollection.find(query).toArray()
      // console.log(result);
      res.send(result)
    })

    app.delete('/mypetdelete/:id', async (req, res) => {
      let id = req.params.id
      let query = { _id: new ObjectId(id) }
      let result = await petsCollection.deleteOne(query)
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

    // petstatusbyuser

    app.patch('/petstatusbyuser/:id', async (req, res) => {
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

    // app.get('/petlisting',async(req,res)=>{
    //   // let email=req.params.email 

    //   let result= await petsCollection.aggregate([
    //     {
    //       $match:{adopted:false}
    //     },
    //     {
    //       $sort: { date: -1 } 
    //     }
    //   ]).toArray();

    //   res.send(result)
    // })

    app.get('/petlisting', async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const initialLimit = parseInt(req.query.initialLimit) || 9;
      const subsequentLimit = parseInt(req.query.subsequentLimit) || 6;
      const limit = page === 1 ? initialLimit : subsequentLimit;
      const skip = page === 1 ? 0 : initialLimit + (page - 2) * subsequentLimit;

      const nameFilter = req.query.name || "";
      const categoryFilter = req.query.category || "";
    
      const matchStage = { adopted: false };
      if (nameFilter) matchStage.name = { $regex: nameFilter, $options: "i" };
      if (categoryFilter) matchStage.category = categoryFilter;

      const total = await petsCollection.countDocuments(matchStage);
      let results = await petsCollection.aggregate([
        { $match: matchStage },
        { $sort: { date: -1 } },
        { $skip: skip },
        { $limit: limit }

      ]).toArray();
      const hasMore = skip + limit < total;
      // res.send({results, nextPage: hasMore ? page + 1 : null,})
      res.json({
        results,
        nextPage: hasMore ? page + 1 : null,
      });

    })
    // app.get('/petlisting', async (req, res) => {
    //   const page = parseInt(req.query.page) || 1;
    //   const initialLimit = parseInt(req.query.initialLimit) || 9;
    //   const subsequentLimit = parseInt(req.query.subsequentLimit) || 6;
    //   const limit = page === 1 ? initialLimit : subsequentLimit;
    //   const skip = page === 1 ? 0 : initialLimit + (page - 2) * subsequentLimit;

    //   const nameFilter = req.query.name || "";
    //   const categoryFilter = req.query.category || "";

    //   const matchStage = { adopted: false };
    //   if (nameFilter) matchStage.name = { $regex: nameFilter, $options: "i" };
    //   if (categoryFilter) matchStage.category = categoryFilter;


    //   const total = await petsCollection.countDocuments(matchStage);
    //   let results = await petsCollection.aggregate([
    //     { $match: matchStage },
    //     { $sort: { date: -1 } },
    //     { $skip: skip },
    //     { $limit: limit }

    //   ]).toArray();
    //   const hasMore = skip + limit < total;
    //   // res.send({results, nextPage: hasMore ? page + 1 : null,})
    //   res.json({
    //     results,
    //     nextPage: hasMore ? page + 1 : null,
    //   });

    // })
    // app.get('/petlisting', async (req, res) => {
    //   const page = parseInt(req.query.page) || 1;
    //   const limit = parseInt(req.query.limit) || 10;
    //   const skip = (page - 1) * limit;
    //   const total = await petsCollection.countDocuments({ adopted: false });
    //   let results = await petsCollection.aggregate([
    //     {
    //       $match: { adopted: false }
    //     },
    //     {
    //       $sort: { date: -1 }
    //     },
    //     { $skip: skip },
    //     { $limit: limit }

    //   ]).toArray();
    //   const hasMore = page * limit < total;
    //   // res.send({results, nextPage: hasMore ? page + 1 : null,})
    //   res.json({
    //     results,
    //     nextPage: hasMore ? page + 1 : null,
    // });
    // })














    app.get('/viewdetails/:id', async (req, res) => {
      let id = req.params.id
      let query = { _id: new ObjectId(id) }
      let result = await petsCollection.findOne(query)
      res.send(result)
    })



    // campaign related
    app.post('/createcampaign', async (req, res) => {
      let pet = req.body
      let result = await campaignCollection.insertOne(pet)
      res.send(result)
    })


    app.get('/donationcampaign', async (req, res) => {
      let result = await campaignCollection.find().toArray()
      res.send(result)
    })


    app.get('/donationdetails/:id', async (req, res) => {
      let id = req.params.id
      let query = { _id: new ObjectId(id) }
      let result = await campaignCollection.findOne(query)
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
          date: pet.date,
          time: pet.time,
          name: pet.name,
          age: pet.age,
          location: pet.location,
          category: pet.category,
          shortDescription: pet.shortDescription,
          longDescription: pet.longDescription
        }
      }

      let result = await petsCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    //  adoptionsrequested

    app.post('/adoptionrequest', async (req, res) => {
      let adoptionrequest = req.body
      let result = await adoptionsrequestedCollection.insertOne(adoptionrequest)
      res.send(result)
    })

    app.get('/adoptorsrequest/:email', async (req, res) => {
      let email = req.params.email
      let query = { adoptorEmail: email }
      let result = await adoptionsrequestedCollection.find(query).toArray()
      res.send(result)
    })

    //  payment related
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      // console.log(amount, 'amount inside the intent')
      let body = req.body
      //  console.log(body);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });
      let id = req.body?.askedforId
      // console.log(id);
      let query = { _id: new ObjectId(id) }
      // let updatedDoc={
      //   $set:{

      //   }
      // }
      // let chadonatedamount=await campaignCollection.findOneAndUpdate({ _id: new ObjectId(id) }, {$set:{}}, { new: true })
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });

    // donators collection

    app.post('/donator', async (req, res) => {
      let donator = req.body
      let result = await donatorsCollection.insertOne(donator)
      let petId = req.body.petdata._id
      let pet = req.body
      let petData = req.body.petdata
      let query = { _id: new ObjectId(petId) }
      let options = { upsert: true }
      if (petData.donatedAmount) {
        let updatedDoc = {
          $set: {
            donatedAmount: petData.donatedAmount + pet.amount
          }
        }
        let successupdate = await campaignCollection.updateOne(query, updatedDoc)
      }
      else {

        let updatedDoc = {
          $set: {
            donatedAmount: pet.amount
          }
        }
        // console.log(pet);
        let successupdate = await campaignCollection.updateOne(query, updatedDoc, options)
      }


      res.send(result)
    })


    app.get('/donators/:donationid', async (req, res) => {
      let id = req.params.donationid
      // console.log(id);
      let query = { askedforId: id }

      let result = await donatorsCollection.find(query).toArray()
      res.send(result)
      // console.log(result);
    })


    app.get('/mydonation/:email', async (req, res) => {
      let email = req.params.email
      let query = { email: email }
      let result = await donatorsCollection.find(query).toArray()
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
