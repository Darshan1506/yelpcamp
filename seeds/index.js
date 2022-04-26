const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const {places , descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("Database connected");
})
const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<20;i++){
        const rand1000= Math.floor(Math.random()*1000);
        const price= Math.floor(Math.random()*20 + 10);
        const camp = new Campground({
            author:"6259515e822a6411fb2ae78a",
            location :`${cities[rand1000].city} , ${cities[rand1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude,
                ]
            },
            images:[
                {
                    url: 'https://res.cloudinary.com/atharva-college/image/upload/v1650910851/YelpCamp/othhhjxxttao3kovg987.jpg',
                    filename: 'YelpCamp/othhhjxxttao3kovg987',
                },
                {
                    url: 'https://res.cloudinary.com/atharva-college/image/upload/v1650910851/YelpCamp/othhhjxxttao3kovg987.jpg',
                    filename: 'YelpCamp/othhhjxxttao3kovg987',
                }
              ],
            description:'It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum',
            price: price,
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})