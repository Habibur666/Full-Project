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
  initData.data = initData.data.map(obj => ({ ...obj, owner: "69032f7d85fb235e91acaeff" }));
  await Listing.insertMany(initData.data);
  console.log("Database Initialized");
}

if (require.main === module) {
  initDb().catch(err => {
    console.error('Failed to initialize DB:', err);
    process.exit(1);
  });
}
