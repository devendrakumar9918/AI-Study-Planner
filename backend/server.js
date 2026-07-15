require("dotenv").config();


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // 👈 ye naya add
const User = require("./user");
const Subject = require("./subject");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

// 👇 MongoDB connection
console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("✅ MongoDB Connected");
    console.log("Database:", mongoose.connection.db.databaseName);
    console.log("Ready State:", mongoose.connection.readyState);
})
.catch(err => {
    console.error("Mongo Error:", err);
});
// test route
app.get("/", (req, res) => {
    res.send("MY NEW TEST MESSAGE");
});

app.post("/signup", async (req, res) => {

    try {

const { name, email, password } = req.body;

const existingUser = await User.findOne({ email });

if(existingUser){
return res.json({ message: "User already exists" });
}

const hashedPassword = await bcrypt.hash(password, 10);
const newUser = new User({
    name,
    email,
    password: hashedPassword
});

await newUser.save();

res.json({ message: "Signup Successful" });

}catch (error) {
    console.error("Signup Error:");
    console.error(error);

    res.status(500).json({
        message: error.message
    });
}

});

app.post("/login", async (req, res) => {

try{

const { email, password } = req.body;

const user = await User.findOne({ email });

if(!user){
return res.json({ message: "User not found" });
}

const isMatch = await bcrypt.compare(password, user.password);

if(isMatch){

const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
);

return res.json({
    message: "Login Successful",
    token: token,
    name: user.name,
    email: user.email
});

}else{
    return res.json({ message: "Invalid Password" });
}

}catch(error){
console.log(error);
res.json({message:"Error Signup"})
}

});

app.post("/add-subject", async (req, res) => {
    console.log(req.body);
    try {

        const { email, subject, date, level } = req.body;

        const newSubject = new Subject({
            email,
            subject,
            date,
            level
        });

        await newSubject.save();

        console.log("Saved Document:", newSubject);

        res.json({
            message: "Subject Added Successfully"
        });

    } catch (error) {
        console.log(error);

        res.json({
            message: "Error Adding Subject"
        });
    }
});

app.get("/subjects", async (req,res) => {
  try {
    let email = req.query.email;

    let data = await Subject.find({ email: email });


    // console.log(data);

    res.json(data);
  } catch(error) {
    console.log(error);
    res.json([]);
  }
});

app.delete("/delete-subject/:id", async (req, res) => {

try {

await Subject.findByIdAndDelete(req.params.id);

res.json({ message: "Deleted Successfully" });

} catch (error) {

console.log(error);

res.json({ message: "Error deleting subject" });

}

});

app.put("/complete-subject/:id", async (req, res) => {
    // console.log("COMPLETE SUBJECT ROUTE HIT");

        // console.log("PUT ROUTE HIT");
        // console.log(req.params.id);
    try {
        await Subject.findByIdAndUpdate(req.params.id, {
            completed: true
        });

        res.json({ message: "Subject Completed" });

    } catch (error) {
        console.log(error);
        res.json({ message: "Error Completing Subject" });
    }
});

console.log("SERVER FILE LOADED");

app.post("/generate-plan", async (req, res) => {
    // console.log("✅ NEW AI PROMPT RUNNING");
    try {

        // console.log("GENERATE PLAN ROUTE HIT");

        const { subjects } = req.body;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

const prompt = `
You are an AI Study Planner.

Subjects:
${subjects}

Create ONLY a one-day study timetable.

Rules:
- Start from 9:00 AM
- End at 6:00 PM
- Include short breaks
- Maximum 8 study sessions
- Keep each task in 1 line
- Keep total response under 250 words

Format exactly like this:

# AI Study Plan

09:00 AM - 10:30 AM | DSA
10:30 AM - 10:45 AM | Break
10:45 AM - 12:00 PM | DBMS
12:00 PM - 01:00 PM | Aptitude
01:00 PM - 02:00 PM | Lunch
02:00 PM - 03:30 PM | DSA Practice
03:30 PM - 03:45 PM | Break
03:45 PM - 05:00 PM | DBMS Revision
05:00 PM - 06:00 PM | Aptitude Practice

if(line.includes("Study Tips")){
    doc.setTextColor(52,152,219);
    doc.setFont("helvetica","bold");
}else{
    doc.setTextColor(40);
    doc.setFont("helvetica","normal");
}

Study Tips:
• Tip 1
• Tip 2
• Tip 3

Do not explain anything.
Do not write paragraphs.
Do not write introductions.
Only return the timetable.
`;
        const result = await model.generateContent(prompt);

        res.json({
            plan: result.response.text()
        });

    } catch (error) {
        console.log(error);

        res.json({
            plan: "Error generating plan"
        });
    }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});