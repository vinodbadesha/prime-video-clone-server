const express = require("express")
const path = require("path")
const app = express()
app.use(express.json())

const {open} = require("sqlite")
const sqlite3 = require("sqlite3")

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

// API to get the users data
app.get("/login", async (request, response) => {
    const getLoginData = `
        SELECT name, email FROM users;
    `
    const allUsers = await db.all(getLoginData)
    response.send(allUsers)
})

// API to register a new user
app.post("/register", async (request, response) => {
    const {name, email, hashedPassword, phoneNumber} = request.body
    const registerUser = `
        INSERT INTO users(name, email, hashed_password, phone_number)
        VALUES (
            "${name}", "${email}", "${hashedPassword}", "${phoneNumber}"
        );
    `
    await db.run(registerUser)
    response.send("User added successfully")
})