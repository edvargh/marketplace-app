# Marketplace app
***

## Description 
A full-stack web application where users can:
- list items
- browse items based on filters
- mark items as favorite 
- message sellers 
- Send item reservation requests to sellers
- Buy items (require vipps and ngrok)


## Includes:
- secure authentication
- image upload to cloudinary
- item recommendations
- payment integration with the vipps test environment.
<br>
***

## Technical requirements
- **Frontend**: Vue 
- **Backend**: Spring Boot (Java 21), REST API
- **Database**: MySQL (hosted on Railway)
- **Authentication**: JWT 
- **Image Storage**: Cloudinary
- **env files**: Files with necessary keys (please read the env files section)
- **Payments**: Vipps (test environment)
- **Deployment**: Database hosted on Railway
- **Testing** : vitest and cypress (npm install automatically installs them)


## <span style="color:red;">  IMPORTANT env files (must read) :</span>
  In order for the project to run the user needs the correct env-files with secret keys and the necessary tokens to run the project. In the backend folder, you'll find an .env.example file. Replace it with your own backend .env file containing the necessary keys."

  The same goes for the front end, in the front end folder there is an .env.example file, replace that with the frontend .env file. 
  Both folders must have their respective env files in order for the project to run as intended.

  The backend .env file consist of keys for:
  - MySQL Database 
  - Cloudinary 
  - Vipps
  - JWT

  The frontend .env file has the base URL for the front end API
***

# Installation Manual
**Prerequisites:**
***Backend***

- **Java Development Kit (JDK) 21**
- **Maven**
- **MySQL**
- **Git**
- **IntelliJ IDEA (Optional if you want to run it with the run button in IntelliJ IDEA)**

**Prerequisites:**
***Frontend***
- **npm**
- **Node.js (version 18 or above)** 
- **Git**

**testing**
- Running 
<pre>mvn clean install </pre> will download automatically run the tests
- All testing tools (Vitest and Cypress) are installed automatically with npm install


**Optional:**
- **Ngrok (Optional if you want to make payments with vipps' test enviroment)**
- **The vipps test application**

**Link to download JDK 21:**
- https://www.oracle.com/java/technologies/downloads/#java11

**Link to download Maven:**
- https://maven.apache.org/download.cgi

<br></br>

# IDE (downloads suggestions for IDEs)

**Link to download IntelliJ IDEA (Optional):**
- https://www.jetbrains.com/idea/download/?section=windows

**Link to download VScode (Optional)**
- https://code.visualstudio.com/download

<br></br>
# Buy items now in project (must have vipps test environment and ngrok)
 
To download and use vipps in the project follow the link below and follow the instructions starting from section App installation. Ask project owner for vipps test user and ngrok auth token. (For our teachers we will have a .txt file with the necessary tokens for vipps and ngrok at the root of the project in the zip file)

**Link and tutorial to download vipps and use the test environment**
- https://developer.vippsmobilepay.com/docs/knowledge-base/test-environment/

**Link to download Ngrok (Optional/ necessary for vipps):**
- https://ngrok.com/downloads


**N.B. Make sure that you download it for the correct operating systems (Windows, Mac, Linux etc...)**

### Ngrok setup 
1. **Download Ngrok**
2. **Unzip the downloaded file**
3. **Open a terminal in the folder where ngrok is located.**
To test vipps payments in this application, you must use a preregistered ngrok domain:
- https://mentally-crucial-quagga.ngrok-free.app
This domain is tied to a specific ngrok account.

4. **Ask the project owner for the ngrok authtoken**

5. **Run this command:**
<pre>ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE</pre>

6. **Run this command:**
<pre>ngrok http 8080 --domain=mentally-crucial-quagga.ngrok-free.app</pre>

7. **Keep the ngrok tunnel running while testing vipps payments.**

<br>

# Getting Started
<br>
Follow these steps to set up and run the project on your local machine:
<br></br>
1. Clone the Repository


Clone the project repository to your local machine using Git. 
<pre>git clone https://github.com/edvargh/marketplace-app.git </pre>

Then navigate into the project directory:
<pre>cd marketplace-app</pre>
<br></br>
2. Set Up Environment Variables
<br>

***NB: Remember to replace the .env.example with the correct env file***

Backend: Follow the back end set up

Frontend: Follow front end set up 



# Backend set up
1. **Navigate to backend**
<pre>cd backend</pre>

2. **Build**
<pre>mvn clean install</pre>

3. **Run**
<pre>mvn spring-boot:run</pre>

***
<br>


# Frontend set up
1. **Navigate to frontend**
<pre>cd frontend </pre>


2. **Install the necessary libraries**
<pre>npm install </pre>

3. **Start the development server**
<pre>npm run dev</pre>

4. **Build for production:**
<pre>npm run build</pre>

5. **Run Unit Tests using Vitest**
<pre>npm run test:unit</pre>

6. **Run End-to-End Tests with Cypress**

- There is 2 different ways to run the cypress tests: 1. interactive mode (GUI) 2. Headless mode (CLI-only) 

**6.1. Cypress test interactive mode run:** 
<pre>npx cypress open</pre>
This command opens cypress test runner where you can choose which test you want to run, this is also faster than the other method.


**6.2. Cypress test headless mode run:** 
<pre>npx cypress run</pre>
This commands will make the tests run in a browser without opening the graphical interface. This is slower than the other mode. 
