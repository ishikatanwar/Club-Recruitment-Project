##     College Club Recruitment Platform (AI & IoT Enabled) 🚀    ##

#   Project Overview

    This project is a modern, full-stack recruitment platform designed to solve the common disconnect between college students and campus organizations. Built for a hackathon, it leverages AI to personalize club discovery and integrates IoT concepts (QR Codes) for real-time engagement tracking.

# The Innovation: AI & IoT Features

    |Feature|	                                     |Technology|	                                       |Benefit|
    |:---|                                           |:---|                                                |:---|
    |Smart Club Matching (AI)|	                     |Scikit-learn (TF-IDF, Cosine Similarity)|	           |Recommends the top 5 most compatible clubs to students based on their skills, interests, and academic major.|
    |Real-time Campus Buzz (IoT)|                  	|SQLAlchemy/Flask (Tracks recent attendance data)|	   |Displays a live leaderboard of the most active clubs on the homepage, based on recent event check-ins.|     
    |Application & Attendance Tracker|    	        |QR Code Generation (Backend)|                         |Club coordinators can generate unique QR codes for events; students scan the code to instantly mark attendance and track event engagement.|
    |Intelligent Chatbot|	                        |Flask/Intent-Based NLP|	                           |Provides instant answers to FAQs about joining clubs and event schedules, improving user support.|


##      Core Features Implemented      ##

     Club Directory: Comprehensive list with filtering by technical/non-technical tags, open positions, and interview dates.

     Personalized Student Dashboard: Shows individual recommendations, application status (Pending/Accepted), and profile completion status.

     Club Coordinator Dashboard: Management hub to view applications, member feedback, and generate QR codes for events.

     Persistent Profile: Student profiles are saved to the SQLite database and automatically fetched to persist data upon page refresh.

##       🛠️ Tech Stack      ##

     |Category|        	|Technology|        	         |Purpose|
     |:----|            |:----|                          |:----|
     |Backend|         	|Python, Flask|               	 |API endpoints, Data processing, Server hosting.|
     |AI/ML|           	|Scikit-learn, TF-IDF|	         |Content-Based Recommendation System.|
     |Frontend|	        |React.js, React Router|	     |Modern, component-based UI and navigation.|
     |Data/State|	    |SQLite, Flask-SQLAlchemy|	     |Database management.|
     |Communication|    |Axios, Flask-CORS|	             |HTTP requests between frontend and backend.|
     |IoT Tools|       	|qrcode (Python Library)|        |QR code image generation.|




##     🏃 Local Setup and Installation Guide    ##

Follow these steps precisely. You will need two separate terminal windows open simultaneously: one for the Backend and one for the Frontend.

Terminal 1: Backend Setup (Flask Server)
   ->  1. Navigate to the Backend:
             
               Bash
               cd backend
   ->  2. Activate Virtual Environment:

              Bash
              source venv/bin/activate

   ->  3. Install Python Dependencies:

              Bash
              pip install Flask Flask-SQLAlchemy Flask-Bcrypt scikit-learn nltk qrcode[pil] flask-cors
 
   ->  4. Run the Server: The server will automatically create the site.db file and populate it with dummy data.

             Bash
             python app.py
(The backend is now running on http://127.0.0.1:5000. Keep this terminal open.)

Terminal 2: Frontend Setup (React App)
   ->  1. Navigate to the Frontend: (Go back up one directory, then into the frontend folder)

             Bash
             cd ../frontend
   -> 2. Install JavaScript Dependencies:

             Bash
             npm install
   -> 3. Start the Frontend:

              Bash
              npm start
(The website will open automatically at http://localhost:3000.)

#  Demo Credentials
  ->  Student Profile (for Dashboard Demo): Use the hardcoded ID 1 to view the main demo profile.

  ->  Club Coordinator Profile: (for Officer Dashboard Demo): Use the hardcoded ID 2 to view the club management dashboard.





##    License   ##

   This project is open-source. Feel free to use and modify it for non-commercial purposes.
