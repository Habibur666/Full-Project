# 🌍 Wanderlust (Backend)

Wanderlust is a **backend-only web application**.  
It provides RESTful APIs for user authentication, property listings, image uploads, and reviews.

This project focuses purely on **server-side logic**, **database operations**, and **API design**.

---

## ✨ Features

### 🔐 Authentication
- User Signup
- User Login
- User Logout

### 🏠 Listings
- View all listings (available to everyone)
- Create new listing (**login required**)
- Edit listing (**only by the owner**)
- Delete listing (**only by the owner**)

### ⭐ Reviews
- View all reviews for a listing (available to everyone)
- Add review (**login required**)
- Edit review (**only by the owner**)
- Delete review (**only by the owner**)

---

## 🛠️ Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB  
- **ODM:** Mongoose  
- **Authentication:** JWT / Passport.js  
- **Image Upload:** Multer / Cloudinary  
- **Environment Management:** dotenv  
