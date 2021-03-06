if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const mongoose  = require('mongoose');
const app = express();
const path = require('path')
const ejsMate = require('ejs-mate')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/user');
const MongoStore = require('connect-mongo');
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
const morgan = require('morgan')
// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})


const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    // console.log("Database connected");
})
app.engine('ejs', ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(morgan('dev'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize())

const secret = process.env.SECRET || 'thisisnotacode'
const store = MongoStore.create({
    mongoUrl:dbURL,
    secret,
    touchAfter: 24*60*60
})

store.on("error",function(e){
    // console.log("seession Store Error",e)
})

const sessionConfig = {
    store:store,
    name:'camp',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
   res.locals.success= req.flash('success');
   res.locals.error= req.flash('error');
   next();
})

// app.get('/fakeuser',async(req,res)=>{
//     const user = new User({email:'darshan@gmail.com',username:'darshann'})
//     const newUser = await User.register(user,'chicken')
//     res.send(newUser)
// })



app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.get("/",(req,res)=>{
    res.render('home');
});

// app.get("/makecampground",async(req,res)=>{
//     const camp = new Campground({title:'My BackYard',description:'Cheap camping'})
//     await camp.save();
//     res.send(camp)
// });



app.all('*',(req,res,next)=>{
    next(new ExpressError('page not Found',404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`serving on port ${port}`)
})