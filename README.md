##          Recruitment & IoT Management Platform      ##

A full-stack web application designed to streamline the recruitment process through campaign management, applicant scoring (AI integration), and centralized administration with real-time IoT system health monitoring.

 ##           ✨ Features       ##
 
  👩‍💼 Recruiter Pages
  
    -> Recruiter Dashboard: Central hub displaying key performance indicators (KPIs) like total applicants, stage conversion rates, and real-time statistics.
    -> Recruitment Campaigns: Core workflow for creating, managing, and defining stages/deadlines for hiring campaigns.
    -> Applicant Management: View detailed applicant profiles, resumes (via File Upload System), AI application scores, and move applicants through the custom workflow stages.
    -> Club Management: Tools for creating and managing club profiles, assigning organizers, and updating club information.
    -> Analytics & Reports: Detailed insights into AI scoring trends and applicant skill sets.

  👑 Admin Pages
  
    -> Admin Dashboard: High-level overview of platform health, including user statistics, system performance, and IoT device status.
    -> User Management: Functionality to view, manage, and modify user roles (Applicant, Recruiter, Admin).
    -> Content Management: Pages to manage global platform announcements and terms of service.
    -> System Monitoring: Dedicated section for viewing system logs, health checks, and a dashboard for IoT Environmental Monitoring and Device Management.


##    🛠️ Tech Stack      ##
   This project is built using a modern MERN-like stack:

    |Category|	        |Technology|                                                                       	|Purpose|
    |:----|             |:---|                                                                             |:---|
    |Frontend|         	|React(JavaScript/CSS)|	                                                           |Building dynamic, role-based user interfaces and dashboards.|
    |Backend|          	|Node.js (Express.js)|	                                                            |Creating a robust RESTful API for routing and business logic.|
    |Database|         	|MongoDB / PostgreSQL / SQLite (if using a .db file locally)|	                     |Data persistence for users, campaigns, and application data.|
    |Key Integrations|  |AI Scoring Service, File Upload System, IoT Communication Layer(Mock/Simulation)|	|Handling specialized platform functionalities.|

##       Export to Sheets     ##
🚀 Getting Started
Follow these steps to set up and run the project locally.

1. Prerequisites
Ensure you have the following installed:
        -> Node.js (LTS version)
        -> Git

2. Clone the Repository
          Bash:

               git clone <YOUR_GITHUB_REPO_URL>
               cd recruitment-platform
3. Environment Setup (Critical)
You must set up your environment variables for both the client and server.

        -> Create a file named .env inside the /server directory.
       -> Copy the content from /server/.env.example into your new .env file and replace the dummy values with your actual secrets and connection strings.

        |Variable|	           |Description|
        |:---|                 |:----| 
        |PORT|	               |Port for the backend (e.g., 5000)|
        |MONGO_URI / DB_FILE|	 |Connection string for MongoDB or file path for SQLite.|
        |JWT_SECRET|	         |Secret key for user authentication.|
        |AI_SERVICE_URL|   	   |Endpoint for the AI application scoring service.|
        |IOT_API_KEY|   	     |Key for accessing the simulated IoT monitoring data.|


5. Install Dependencies
You need to install dependencies for both the backend and frontend.
         Bash:

                  # 1. Install Backend dependencies
                   cd server
                   npm install

                  # 2. Install Frontend dependencies
                    cd ../client
                    npm install

                  # 3. Return to root directory
                    cd ..

6. Database Setup (Seeding)
If your project uses a database, you must initialize the schema and populate it with initial data.
             Bash:

                 # Run the database setup script (may vary based on implementation)
                 # This command typically creates the database file/tables and inserts initial users.
                 npm run db:setup
 


## 🏃 Running the Application    ##

 You need to start both the server and the client separately.

Start the Backend (API Server)
       Bash:
   
           cd server
           npm start
           # Server should run on http://localhost:5000 (or your configured port)
Start the Frontend (React App)
        Bash:
  
            cd client
            npm start
            # Client should open in your browser on http://localhost:3000



##    🔑 Test Credentials     ##
Use these credentials to test both user roles after seeding the database:

    |Role|        |Username| 	   |Password|
    |:---|        |:-----|       |:---|
    |**Admin**|	      |'admin'|	       |'admin123'|
    |**Recruiter**|	  |'recruiter'|	   |'recruiter123'|




##    🤝 Contribution      ##
Feel free to report bugs, suggest features, or submit pull requests!

      -> Fork the repository.
      -> Create your feature branch (git checkout -b feat/my-new-feature).
      -> Commit your changes (git commit -m 'feat: added new dashboard metric').
      -> Push to the branch (git push origin feat/my-new-feature).
      -> Open a Pull Request.


