const Listing = require("../models/listing");

module.exports.deleteListing = async (req,res)=>{
  let {_id}=req.params;
  await Listing.findByIdAndDelete(_id);
  res.redirect("/listings");
  let originalImageUrl=listing.image.url;
  originalImageUrl=originalImageUrl.replace('/uploads','/uploads/h_300,w_250');
  res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing=async (req,res)=>{
  let {_id}=req.params;
  const update = { ...req.body };
  }
  let xyz=await Listing.findByIdAndUpdate(_id, update, { runValidators: true });
  if(typeof req.file !== 'undefined'){
  let url=req.file.path;
  let filename=req.file.filename;
  xyz.image={url: url, filename: filename};
  await xyz.save();
  }
  req.flash("success", "Successfully updated the listing!");
  res.redirect("/listings");
};

module.exports.editListing=async (req,res)=>{
  let {_id}=req.params;
  const listing=await Listing.findById(_id);
  res.render("listings/edit.ejs", {listing});
};

module.exports.createListing=async (req, res) => {
  let url=req.file.path;
  let filename=req.file.filename;
  const { title, description, price, location, country, image } = req.body;
  const imageObj = (typeof image === 'object' && image.url) ? { url: image.url } : (image ? { url: image } : undefined);
  const newListing = new Listing({ title, description, price, location, country, image: imageObj });
  newListing.owner=req.user._id;
  newListing.image={url: url, filename: filename};
  await newListing.save();
  req.flash("success", "Successfully created a new listing!");
  res.redirect(303, `/listings`);
};

module.exports.showListing=async (req,res)=>{
  let listing=await Listing.findById(req.params._id)
    .populate({
      path: 'review',
      populate: {
        path: 'author',
        select: 'username'
      }
    })
    .populate({
      path: 'owner',
      select: 'username email'
    });
  res.render("listings/show.ejs", {listing});
};

module.exports.indexListing=async (req,res)=>{
  let allListings=await Listing.find({}).populate('owner');
  res.set('Cache-Control', 'no-store');
  res.render("listings/index.ejs", {allListings});
};

