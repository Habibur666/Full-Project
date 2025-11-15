// init/index.js
// Simple database seeding script used to populate the listings collection with sample data.
// Run only when invoked directly: `node init/index.js`
const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const Mongo_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then((res)=>{
  console.log("Ok");
}).catch((err)=>{
  console.log(err);
})

async function main(){
  await mongoose.connect(Mongo_URL);
}

const initDb=async()=>{
  await Listing.deleteMany({});
  // Ensure we return a new array with the owner field set on each object
  initData.data = initData.data.map(obj => ({ ...obj, owner: "69032f7d85fb235e91acaeff" }));//add owner field to each listing
  await Listing.insertMany(initData.data);
  console.log("Database Initialized");
}

// Only run the initializer when this file is executed directly (not when required)
if (require.main === module) {
  initDb().catch(err => {
    console.error('Failed to initialize DB:', err);
    process.exit(1);
  });
}