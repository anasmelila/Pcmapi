 Products & Categories (Node.js + MongoDB)

This project is a RESTful API built using **Node.js**, **Express**, and **MongoDB (Mongoose)**.  
It manages **categories** in a 4-level UNSPSC hierarchy and **products** linked to level-4 (Commodity) categories.

---

## Features
- Manage categories in **4 levels**:  

  **Segment → Family → Class → Commodity**
- Products can only be added under **Commodity (Level 4)**.
- Validations:
  - `unspsc_code` must be unique.
  - Category depth cannot exceed 4 levels.
  - Products must link to a valid Level 4 category.
- Count products under a category (including descendants).

---

##  Installation


# Clone repository
git clone https://github.com/anasmelila/Pcmapi.git


# Install dependencies
After cloning the repository, run the following command to install all required packages:


npm install express mongoose joi nodemon dotenv


# Setup .env

Inside .env, configure MongoDB:


Copy code
MONGO_URI=mongodb://127.0.0.1:27017/ShopApi
PORT=4000
 Run Project

# Start in development mode
npm run dev

# Or start normally

 Database Schema
Category Schema

{
  name: String (required),
  description: String (required),
  unspsc_code: String (required, unique),
  parentId: ObjectId (self-reference, null for Segment)
}
Product Schema


{
  name: String (required),
  description: String (required),
  image: String (required, URL),
  categoryId: ObjectId (ref Category, must be Level 4)
}
 Category Hierarchy


Segment (parentId = null)
  └── Family
       └── Class
            └── Commodity (Level 4)
                 └── Products

 API Endpoints
 Create Segment (Level 1)
 code
curl -X POST http://localhost:4000/api/categories \
-H "Content-Type: application/json" \
-d '{
  "name": "Food",
  "description": "All types of food",
  "unspsc_code": "50000000"
}'


 Create Family (Level 2)


curl -X POST http://localhost:4000/api/categories \
-H "Content-Type: application/json" \
-d '{
  "name": "Processed Foods",
  "description": "Canned and packaged items",
  "unspsc_code": "50100000",
  "parentId": "PUT_SEGMENT_ID_HERE"
}'


Create Class (Level 3)

curl -X POST http://localhost:4000/api/categories \
-H "Content-Type: application/json" \
-d '{
  "name": "Canned Fruits",
  "description": "All canned fruits",
  "unspsc_code": "50131700",
  "parentId": "PUT_FAMILY_ID_HERE"
}'


 Create Commodity (Level 4)


curl -X POST http://localhost:4000/api/categories \
-H "Content-Type: application/json" \
-d '{
  "name": "Canned Peaches",
  "description": "Peaches preserved in cans",
  "unspsc_code": "50131703",
  "parentId": "PUT_CLASS_ID_HERE"
}

 Add Product (Linked to Level 4 Commodity)

curl -X POST http://localhost:4000/api/products \
-H "Content-Type: application/json" \
-d '{
  "name": "Organic Peaches",
  "description": "Fresh canned peaches",
  "image": "http://example.com/peach.jpg",
  "categoryId": "PUT_COMMODITY_ID_HERE"
}'

 Get Product Count for a Category


curl -X GET http://localhost:4000/api/categories/PUT_CATEGORY_ID_HERE/product-count
 Response:

{ "count": 3 }


 Notes

Replace all PUT_*_ID_HERE with real _id values returned from previous API calls.

Always follow the hierarchy (Segment → Family → Class → Commodity).

Products can only be added to Commodity (Level 4) categories.
