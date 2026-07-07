IMPORTANT UPDATE

Ignore and completely discard the previous project requirements, architecture, business logic, prompts, APIs, agents, database schema, and backend implementation.

The previous project was an AI Personal Loan Sales Assistant / NBFC Loan Chatbot.

I NO LONGER WANT THAT PROJECT.

Delete all loan-related logic including:

- Loan eligibility
- Loan application
- KYC
- PAN verification
- Aadhaar verification
- Underwriting
- EMI calculation
- Sanction letter
- Credit score
- Banking APIs
- Loan agents
- Financial database tables
- Loan prompts
- Loan routes
- Loan controllers
- Loan services
- Loan models
- Loan middleware
- Loan documentation

Remove everything related to the previous loan chatbot.

DO NOT MODIFY MY FRONTEND.

My React frontend is already completed.

Keep the existing UI exactly as it is and only connect it with the new backend APIs.

------------------------------------------------------------

The new project is:

AI Shopping Sales Bot

Purpose

The AI Sales Bot helps users discover, compare, and choose products before purchasing.

Example:

User:
"I want a laptop under ₹50,000."

The AI should:

- Understand the user's intent.
- Search products matching the requirements.
- Recommend the best options.
- Explain why each product is recommended.
- Compare products side by side.
- Show specifications.
- Display prices from multiple shopping websites.
- Provide purchase links.
- Answer follow-up questions.
- Maintain conversation history.

This is NOT an ecommerce website.

It is an AI-powered Shopping Assistant.

------------------------------------------------------------

Use the following stack:

Frontend
React (Already Completed)

Backend
Node.js
Express.js

Database
PostgreSQL

ORM
Prisma

Authentication
JWT

Validation
Zod

AI
Google Gemini 2.5 Flash

Architecture
MVC + Service Layer + Multi-Agent AI

------------------------------------------------------------

Implement these AI Agents:

- Master Agent
- Product Search Agent
- Recommendation Agent
- Product Comparison Agent
- Price Aggregation Agent
- Review Summary Agent
- Conversation Memory Agent

------------------------------------------------------------

Main Features

- AI Chat
- Product Search
- Product Recommendation
- Product Comparison
- Multi-store Price Comparison
- Product Specification Viewer
- AI Review Summary
- Conversation Memory
- Search History
- Wishlist
- Recently Viewed Products

------------------------------------------------------------

Backend APIs

POST /auth/register
POST /auth/login
GET /profile

POST /chat

POST /products/search

POST /products/compare

GET /products/:id

GET /products/recommend

GET /price/:productId

GET /reviews/:productId

POST /wishlist

GET /wishlist

POST /history

GET /history

------------------------------------------------------------

Create a production-ready backend with:

- Clean architecture
- Reusable services
- Proper folder structure
- JWT authentication
- PostgreSQL database
- Prisma schema
- Gemini integration
- Error handling
- Logging
- Swagger documentation
- Environment variables
- Professional coding standards

Do NOT recreate or redesign the frontend.

Only build and connect the backend according to these new requirements.

This new Shopping Sales Bot completely replaces the previous Loan Sales Bot project.


Ah, yes! I remember this one now. This is a **completely different Sales Bot** from the loan chatbot.

Your project is actually an **AI Shopping Assistant / AI Sales Bot**, similar to an AI-powered shopping advisor.

## Project Overview

The Sales Bot helps users discover, compare, and purchase products intelligently.

For example:

> User: *I want a laptop under ₹50,000.*

The AI should:

* Understand the user's requirements.
* Search a product database or APIs.
* Recommend the best laptops.
* Explain why each laptop is suitable.
* Compare multiple laptops side by side.
* Show prices from different e-commerce websites.
* Provide purchase links.
* Answer follow-up questions like:

  * "Which one has the best battery?"
  * "Which one is best for coding?"
  * "Which one is best for gaming?"
  * "Which one offers the best value for money?"

---

# This is the architecture I recommend

```
React Frontend
       │
       │
Node.js + Express
       │
       │
 Master AI Agent
       │
 ├──────────────┐
 │              │
Product Agent   Search Agent
 │              │
 │              │
Compare Agent   Price Agent
 │              │
Recommendation Agent
 │
PostgreSQL
```

---

# AI Agents

Instead of using one chatbot, build multiple specialized agents.

### 1. Master Agent

Responsible for routing the user's request.

Example

User:

> Recommend a laptop under ₹60,000.

↓

Calls

* Search Agent
* Recommendation Agent

---

### 2. Product Search Agent

Searches products.

Example

User

> Gaming laptop under ₹70k

Returns

```
Acer Aspire 7

HP Victus

Lenovo IdeaPad Gaming

ASUS TUF
```

---

### 3. Recommendation Agent

Ranks products.

It should consider

* Budget
* Performance
* Battery
* Display
* Brand
* Reviews
* Value for money

---

### 4. Comparison Agent

Creates comparison tables.

Example

| Feature | Laptop A  | Laptop B       |
| ------- | --------- | -------------- |
| CPU     | i5 13420H | Ryzen 5 7535HS |
| RAM     | 16GB      | 16GB           |
| SSD     | 512GB     | 1TB            |
| Battery | 7 hrs     | 9 hrs          |
| Price   | ₹54k      | ₹56k           |

---

### 5. Price Agent

Shows

Amazon

Flipkart

Croma

Reliance Digital

Vijay Sales

with

```
Price

Discount

Offer

Buy Link
```

---

### 6. Review Agent

Summarizes reviews.

Example

Pros

✔ Excellent display

✔ Fast SSD

✔ Great battery

Cons

✖ Average speakers

✖ Heavy

---

### 7. Deal Agent

Shows

Coupons

Bank Offers

Cashback

No-cost EMI

Exchange Offers

---

# Backend Stack

Node.js

Express.js

PostgreSQL

Prisma

JWT

Gemini 2.5 Flash

Axios

Redis (optional)

Multer

Zod

---

# Database

### Users

```
id

name

email

password
```

---

### Chats

```
id

userId

sessionId

message

role

timestamp
```

---

### Products

```
id

title

brand

category

price

rating

description

image

specifications

amazonLink

flipkartLink

cromaLink

```

---

### Search History

```
id

userId

query

createdAt
```

---

### Wishlist

```
id

userId

productId
```

---

### Recently Viewed

```
id

userId

productId
```

---

# REST APIs

```
POST /auth/register

POST /auth/login

GET /profile

POST /chat

POST /products/search

POST /products/compare

GET /products/:id

GET /products/recommend

GET /price/:productId

GET /reviews/:productId

POST /wishlist

GET /wishlist

POST /history

GET /history
```

---

# AI Flow

```
User

↓

Master Agent

↓

Understand Intent

↓

Search Products

↓

Retrieve Prices

↓

Compare Products

↓

Generate AI Explanation

↓

Return Response
```

---

# Product APIs

Instead of manually adding thousands of products, connect to real product APIs.

Some common options include:

* Google Shopping APIs (via third-party providers)
* Amazon Product Advertising API (requires approval)
* eBay Browse API
* Best Buy API (US-focused)
* Price comparison APIs such as Rainforest API, SerpApi, or DataForSEO (paid services)

These services can retrieve product details, specifications, prices, ratings, images, and links from multiple online stores. For a hackathon or prototype, you can also maintain a PostgreSQL product catalog and periodically sync data from one of these APIs.

---

# Frontend Features

Since your frontend is already built, I would add:

* 💬 ChatGPT-like streaming responses
* 🎤 Voice search
* 📷 Image-based product search ("Find this product")
* 📊 Beautiful comparison tables
* 📈 Price history charts
* ❤️ Wishlist
* 🔖 Save comparisons
* 📥 Export comparison to PDF
* 🔗 One-click "Buy Now" buttons
* 🌙 Dark theme
* 📱 Fully responsive layout
* ⚡ Suggested prompts (e.g., "Best laptop under ₹50k", "Compare iPhone 15 vs Galaxy S24")

This design makes the project feel like an intelligent shopping assistant rather than a basic chatbot, with clear separation of responsibilities across AI agents and a scalable backend architecture.
