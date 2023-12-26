//mongoDB
const { MongoClient} = require("mongodb");
const uri = "mongodb+srv://fakhrul:1235@clusterfakhrul.bigkwnk.mongodb.net/"
const  client = new MongoClient(uri)
//express
const express = require('express')
var jwt = require('jsonwebtoken')
const app = express()
const port = process.env.PORT ||3000;

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VMS API',
            version: '1.0.0'
        },
    },
    apis: ['./index.js'],
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//bcrypt
const bcrypt = require('bcrypt');

const saltRounds = 10;
var hashed;
//token
var token
const privatekey = "PRXWGaming"
var checkpassword;

app.use(express.json());

/**
 * @swagger
 * /loginOwner:
 *   post:
 *     summary: Login for Owner
 *     description: Authenticate an owner user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idNumber:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized - Invalid credentials
 */

//login as Owner
app.post( '/loginOwner',async function (req, res) {
  let {idNumber, password} = req.body
  const salt = await bcrypt.genSalt(saltRounds)
  hashed = await bcrypt.hash(password, salt)
  await loginOwner(idNumber, hashed)
})

/**
 * @swagger
 * /loginSecurity:
 *   post:
 *     summary: Login for Security
 *     description: Authenticate a security user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idNumber:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized - Invalid credentials
 */
 
//login as Security
app.post( '/loginSecurity',async function (req, res) {
  let {idNumber, password} = req.body
  const salt = await bcrypt.genSalt(saltRounds)
  hashed = await bcrypt.hash(password, salt)
  await loginSecurity(idNumber, hashed)
})


/**
 * @swagger
 * /registerOwner:
 *   post:
 *     summary: Register Owner
 *     description: Register a new owner if the user has security role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *               name:
 *                 type: string
 *               idNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Owner registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized - User does not have access to register an owner
 */
//register Owner
app.post('/registerOwner', async function (req, res){
  let header = req.headers.authorization;
  let token = header.split(' ')[1];
  jwt.verify(token, privatekey, async function(err, decoded) {
    console.log(decoded)
    if (await decoded.role == "security"){
      const data = req.body
      res.send(
        registerOwner(
          data.role,
          data.name,
          data.idNumber,
          data.email,
          data.password,
          data.phoneNumber
        )
      )
    }else{
      console.log("You have no access to register an owner!")
    }
})
})

//checkin visitor
app.post('/checkinVisitor', async function (req, res) {
  let header = req.headers.authorization;
  let token = header.split(' ')[1];
  
  jwt.verify(token, privatekey, async function(err, decoded) {
    if (err) {
      console.log("Error decoding token:", err);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    console.log(decoded);
    
    if (decoded && (decoded.role === "owner" || decoded.role === "security")) {
      const data = req.body;
      
      res.send(
        checkinVisitor(
          data.role,
          data.name,
          data.idNumber,
          data.documentType,
          data.gender,
          data.birthDate,
          data.age,
          data.documentExpiry,
          data.company,
          data.TelephoneNumber,
          data.vehicleNumber,
          data.category,
          data.ethnicity,
          data.photoAttributes,
          data.passNumber
        )
      );
    } else {
      console.log("You have no access to check in a visitor!");
    }
  });
});


/**
 * @swagger
 * /checkinVisitor:
 *   post:
 *     summary: Check-in Visitor
 *     description: Check-in a visitor by owner or security personnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *               name:
 *                 type: string
 *               idNumber:
 *                 type: string
 *               documentType:
 *                 type: string
 *               gender:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               age:
 *                 type: integer
 *               documentExpiry:
 *                 type: string
 *                 format: date
 *               company:
 *                 type: string
 *               TelephoneNumber:
 *                 type: string
 *               vehicleNumber:
 *                 type: string
 *               category:
 *                 type: string
 *               ethnicity:
 *                 type: string
 *               photoAttributes:
 *                 type: string
 *               passNumber:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Visitor checked in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized - User does not have access to check in a visitor
 */

//view visitor 
app.get('/viewVisitor', async (req, res) => {
  await client.connect();
  let header = req.headers.authorization;
  let token = header.split(' ')[1];
  
  jwt.verify(token, privatekey, async function(err, decoded) {
    console.log(decoded);
    
    if (decoded && (decoded.role === "owner" || decoded.role === "security")) {
      const visitors = await client.db("assignmentCondo").collection("visitor").find({}).toArray();
      
      console.log(visitors); // Print visitors in the terminal
      
      res.send(visitors);
    }
  });
});

app.get('/', async (req, res) => {
  res.send("hello world")
})


/**
 * @swagger
 * /changePassNumber:
 *   post:
 *     summary: Change Pass Number
 *     description: Change pass number for security personnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               savedidNumber:
 *                 type: string
 *               newpassNumber:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Pass number changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 savedidNumber:
 *                   type: string
 *                 newpassNumber:
 *                   type: string
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Unauthorized - User does not have access
 *       '403':
 *         description: Forbidden - User role does not permit this action
 */

//change pass number
app.post('/changePassNumber', async function (req, res) {
  let header = req.headers.authorization;
  let token = header.split(' ')[1];

  jwt.verify(token, privatekey, async function (err, decoded) {
    if (err) {
      console.log("Error decoding token:", err);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(decoded);

    if (decoded.role === "security") {
      const { savedidNumber, newpassNumber } = req.body;
      await changePassNumber(savedidNumber, newpassNumber);
      res.send(req.body);
    } else {
      console.log("You have no access to change the pass number!");
      return res.status(403).json({ error: 'Forbidden' });
    }
  });
});


//checkout visitor
app.post('/checkoutVisitor', async function (req, res) {
  let header = req.headers.authorization;
  let token = header.split(' ')[1];

  jwt.verify(token, privatekey, async function(err, decoded) {
    console.log(decoded);

    if (decoded && decoded.role === "security") {
      const { name, idNumber } = req.body;
      await checkoutVisitor(name, idNumber);
      res.send(req.body);
    } else {
      console.log("You have no access to check out the visitor!");
      res.status(403).send("Forbidden");
    }
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//////////FUNCTION//////////

//CREATE(createListing for owner)
async function createListing1(client, newListing){
  const result = await client.db("assignmentCondo").collection("owner").insertOne(newListing);
  console.log(`New listing created with the following id: ${result.insertedId}`);
}

//CREATE(createListing for visitor)
async function createListing2(client, newListing){
  const result = await client.db("assignmentCondo").collection("visitor").insertOne(newListing);
  console.log(`New listing created with the following id: ${result.insertedId}`);
}

//READ(login as Owner)
async function loginOwner(idNumber, hashed){
  await client.connect()
  const result = await client.db("assignmentCondo").collection("owner").findOne({ idNumber: idNumber });
  const role = await result.role
  if (result) {
    //BCRYPT verify password
    bcrypt.compare(result.password, hashed, function(err, result){
      if(result == true){
        console.log("Access granted. Welcome")
        console.log("Password:", hashed)
        console.log("Role:", role)
        token = jwt.sign({idNumber: idNumber, role: role}, privatekey);
        console.log("Token:", token);
      }else{
        console.log("Wrong password")
      }
    });
  } 
  else {
      console.log("Owner not registered")
  }
}

//READ(login as Security)
async function loginSecurity(idNumber, hashed){
  await client.connect()
  const result = await client.db("assignmentCondo").collection("security").findOne({ idNumber: idNumber });
  const role = await result.role
  if (result) {
    //BCRYPT verify password
    bcrypt.compare(result.password, hashed, function(err, result){
      if(result == true){
        console.log("Access granted. Welcome")
        console.log("Password:", hashed)
        console.log("Role:", role)
        token = jwt.sign({idNumber: idNumber, role: role}, privatekey);
        console.log("Token:", token);
      }else{
        console.log("Wrong password")
      }
    });
  }
  else {
      console.log("Security not registered")
  }
}

//CREATE(register Owner)
async function registerOwner(newrole, newname, newidNumber, newemail, newpassword, newphoneNumber){
  await client.connect()
  const exist = await client.db("assignmentCondo").collection("owner").findOne({idNumber: newidNumber})
  if(exist){
    console.log("Owner has already registered")
  }else{
    await createListing1(client,
      {
        role: newrole,
        name: newname,
        idNumber: newidNumber,
        email: newemail,
        password: newpassword,
        phoneNumber: newphoneNumber
      }
    );
    console.log("Owner registered sucessfully")
  }
}

//CREATE(checkin Visitor)
async function checkinVisitor(newrole, newname, newidNumber, newdocumentType, newgender, newbirthDate, 
                        newage, newdocumentExpiry, newcompany, newTelephoneNumber, newvehicleNumber,
                        newcategory, newethnicity, newphotoAttributes, newpassNumber){
  //TODO: Check if username exist
  await client.connect()
  const exist = await client.db("assignmentCondo").collection("visitor").findOne({name: newname})
  if(exist){
      console.log("Visitor has already checked in")
  }else{
      await createListing2(client,
        {
          role: newrole,
          name: newname,
          idNumber: newidNumber,
          documentType: newdocumentType,
          gender: newgender,
          birthDate:newbirthDate,
          age: newage,
          documentExpiry: newdocumentExpiry,
          company: newcompany,
          TelephoneNumber: newTelephoneNumber,
          vehicleNumber: newvehicleNumber,
          category: newcategory,
          ethnicity: newethnicity,
          photoAttributes: newphotoAttributes,
          passNumber: newpassNumber 
        }
      );
      console.log("Checked in successfully!")
  }
} 

//UPDATE(change pass number)
async function changePassNumber(savedidNumber, newpassNumber){
  await client.connect()
  const exist = await client.db("assignmentCondo").collection("visitor").findOne({idNumber: savedidNumber})
  if(exist){
    await client.db("assignmentCondo").collection("visitor").updateOne({idNumber: savedidNumber}, {$set: {passNumber: newpassNumber}})
    console.log("Visitor's pass number has changed successfuly.")
  }else{
    console.log("The visitor does not exist.")
  }
}

//DELETE(delete visitor)
async function checkoutVisitor(oldname, oldidNumber){
  await client.connect()
  const exist = await client.db("assignmentCondo").collection("visitor").findOne({name: oldname})
  if(exist){
    checkidNumber = await exist.idNumber;
    if(oldidNumber == checkidNumber){
      await client.db("assignmentCondo").collection("visitor").deleteOne({name: oldname})
      console.log("Visitor account deleted successfully.")
    }else{
      console.log("ID number is incorrect")
    }
  }else{
    console.log("Visitor does not exist.")
  }
}

//Verify JWT Token
function verifyToken(req, res, next) {
  let header = req.headers.authorization;

  if (!header) {
    return res.status(401).send('Unauthorized');
  }

  let token = header.split(' ')[1];

  jwt.verify(token, 'PRXgaming', function(err, decoded) {
    if (err) {
      console.error(err);
      return res.status(401).send('Invalid token');
    }
    res.user = decoded;
    next();
  });
}