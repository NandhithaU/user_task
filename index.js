const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MyUser', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

  mongoose.connection.once("open",(err,data)=>{
    if(!err){
        console.log("Db connection established sucessfully")
    } else {
        console.log("Error in connecting to database",err)
    }
  })

// Define user schema and model
const userSchema = new mongoose.Schema({
  id: {
    type : Number
  },
  name: {
    type : String
  },
  age: {
    type:Number
  }
});

const Users = mongoose.model('Users', userSchema,);

// Middleware to parse JSON
app.use(bodyParser.json());

// Route to get users with filters (name search, age sorting, pagination)
app.get('/users', async (req, res) => {
  try {
    console.log("Query Parameters:", req.query);

    // Dynamic query construction
    let query = {};

    if (req.query.name) {
      query.name = { $regex: new RegExp(req.query.name, 'i') };
    }

    if (req.query.age) {
      query.age = parseInt(req.query.age, 10);
    }

    // Sort by age
    const sortField = req.query.sortBy || 'age';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sortOptions = { [sortField]: sortOrder };

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build the query
   console.log(query);
    const result = await Users.find(query).sort(sortOptions).skip(skip).limit(limit);

    res.setHeader('Cache-Control', 'no-store');
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
