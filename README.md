# Marketplace app
***

## Description 
A full-stack web application where users can:
- list items
- browse items based on filters
- mark items as favorite 
- message sellers 
- Send item reservation requests to sellers
- Buy items

Includes:
- secure authentication
- image upload to cloudinary
- item recommendations
- payment integration with the vipps test environment.
***

## Tech stack
- **Frontend**: Vue 
- **Backend**: Spring Boot (Java 21), REST API
- **Database**: MySQL (hosted on Railway)
- **Authentication**: JWT 
- **Image Storage**: Cloudinary
- **Payments**: Vipps (test environment)
- **Deployment**: Database hosted on Railway
***

## Installation Manual
**Prerequisites:**
- **Java Development Kit (JDK) 21**
- **Frontend(Tam og an fyller inn)**
- **Maven**
- **MySQL**
- **Git**
- **IntelliJ IDEA (Optional if you want to run it with the run button in IntelliJ IDEA)**

**Optional:**
- **Ngrok (Optional if you want to make payments with vipps' test enviroment)**
- **The vipps test application**

**Link to download JDK 21:**
- https://www.oracle.com/java/technologies/downloads/#java11

**Link to download Maven:**
- https://maven.apache.org/download.cgi

**Link to download IntelliJ IDEA (Optional):**
- https://www.jetbrains.com/idea/download/?section=windows

**Link to download Ngrok (Optional):**
- https://ngrok.com/downloads


**N.B. Make sure that you download it for the correct operating systems (Windows, Mac, Linux etc...)**
***

## Getting started
### Ngrok setup (optional, but required for vipps payment)
1. **Download Ngrok**
2. **Unzip the downloaded file**
3. **Open a terminal in the folder where ngrok is located.**
To test vipps payments in this application, you must use a preregistered ngrok domain:
<pre>https://mentally-crucial-quagga.ngrok-free.app</pre>
This domain is tied to a specific ngrok account.
4. **Ask the project owner for the ngrok authtoken**
5. **Run this command:**
<pre>ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE</pre>
6. **Run this command:**
<pre>ngrok http 8080 --domain=mentally-crucial-quagga.ngrok-free.app</pre>
7. **Keep the ngrok tunnel running while testing vipps payments.**

### Backend set up
1. **Navigate to backend**
<pre>cd backend</pre>

2. **Build**
<pre>mvn clean install</pre>

3. **Run**
<pre>mvn spring-boot:run</pre>








