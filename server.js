const express = require("express")
const path = require("path")
const app = express()
app.use(express.json())

const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const dbPath = path.join(__dirname, "primeVideo.db")

let db

const initializeDbAndStartServer = async () => {
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(4000, () => {
            console.log("Server has started at port 4000")
        })
    }
    catch(error){
        console.log(error.message)
        process.exit(1)
    }
}

initializeDbAndStartServer()

// API to register a new user
app.post("/register/", async (request, response) => {
    const {username, email, password, phoneNumber} = request.body
    const userData = `SELECT * FROM users WHERE email = "${email}"`

    const userResponse = await db.get(userData)

    if (userResponse !== undefined){
        response.status(400)
        response.send("User already exists!!!")
    }
    else{    
        const hashedPassword = await bcrypt.hash(password, 10)
        const insertUserQuery = `
            INSERT INTO users(username, email, password, phone_number)
            VALUES("${username}", "${email}", "${hashedPassword}", "${phoneNumber}");
        `

        await db.run(insertUserQuery)
        response.send("User created successfully")
    }
})

// API to login the user
app.post("/login/", async (request, response) => {
    const {email, password} = request.body
    const userData = `SELECT * FROM users WHERE email = "${email}"`
    const userDataResponse = await db.get(userData)

    if (userDataResponse !== undefined){
        const isPasswordCorrect = await bcrypt.compare(password, userDataResponse.password)

        if (isPasswordCorrect){
            const payload = {email, userId: userDataResponse.user_id}
            const jwtToken = jwt.sign(payload, "SECRET")
            response.send({jwtToken})
        }
        else{
            response.status(400)
            response.send("Invalid Password")
        }
    }
    else{
        response.status(400)
        response.send("Invalid User")
    }
})