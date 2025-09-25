# app.py

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
from sqlalchemy import func
import os
import qrcode
import io
import base64
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-super-secret-key'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# --- Data Models ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(60), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')
    
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False)
    club = db.relationship('Club', backref='coordinator', uselist=False)
    applications = db.relationship('Application', backref='student', lazy=True)
    feedback = db.relationship('Feedback', backref='student', lazy=True)
    attendance = db.relationship('Attendance', backref='student', lazy=True)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class StudentProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    major = db.Column(db.String(50))
    interests = db.Column(db.Text) 
    skills = db.Column(db.Text) 
    resume = db.Column(db.String(255))
    personal_details = db.Column(db.Text)

class Club(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    tags = db.Column(db.Text) 
    coordinator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    deadline = db.Column(db.Date)
    contact_info = db.Column(db.String(100))
    
    is_recruiting = db.Column(db.Boolean, default=True)
    open_positions = db.Column(db.Text)
    skills_required = db.Column(db.Text)
    total_members = db.Column(db.Integer, default=0)
    interview_date = db.Column(db.DateTime)
    
    events = db.relationship('Event', backref='club', lazy=True)
    applications = db.relationship('Application', backref='club', lazy=True)
    feedback = db.relationship('Feedback', backref='club', lazy=True)

    def __repr__(self):
        return f"Club('{self.name}')"

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    club_id = db.Column(db.Integer, db.ForeignKey('club.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    qr_code_key = db.Column(db.String(50), unique=True, nullable=False)
    
    attendees = db.relationship('Attendance', backref='event', lazy=True)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('club.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('club.id'), nullable=False)
    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# --- API Endpoints ---

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ('username', 'email', 'password', 'full_name', 'role')):
        return jsonify({"message": "Missing required fields"}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password,
        full_name=data['full_name'],
        role=data['role']
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        if new_user.role == 'student':
            new_profile = StudentProfile(user_id=new_user.id)
            db.session.add(new_profile)
            db.session.commit()
            
        return jsonify({"message": f"{data['role']} registered successfully", "user_id": new_user.id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Username or email already exists. Please choose a different one."}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An unexpected error occurred: {str(e)}"}), 500

@app.route("/clubs", methods=["GET"])
def get_clubs():
    clubs = Club.query.all()
    club_list = []
    for club in clubs:
        club_list.append({
            "id": club.id,
            "name": club.name,
            "description": club.description,
            "tags": club.tags.split(',') if club.tags else [],
            "deadline": club.deadline.isoformat() if club.deadline else None,
            "contact_info": club.contact_info,
            "is_recruiting": club.is_recruiting,
            "open_positions": club.open_positions.split(',') if club.open_positions else [],
            "skills_required": club.skills_required.split(',') if club.skills_required else [],
            "total_members": club.total_members,
            "interview_date": club.interview_date.isoformat() if club.interview_date else None,
        })
    return jsonify(club_list), 200

@app.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    data = request.get_json()
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    
    if not profile:
        return jsonify({"message": "Student profile not found"}), 404

    profile.major = data.get('major', profile.major)
    profile.interests = data.get('interests', profile.interests)
    profile.skills = data.get('skills', profile.skills)
    profile.resume = data.get('resume', profile.resume)
    profile.personal_details = data.get('personal_details', profile.personal_details)

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200

@app.route("/recommendations/<int:user_id>", methods=["GET"])
def get_recommendations(user_id):
    user_profile = StudentProfile.query.filter_by(user_id=user_id).first()
    if not user_profile:
        return jsonify({"message": "Student profile not found"}), 404

    all_clubs = Club.query.all()
    if not all_clubs:
        return jsonify({"recommendations": []}), 200

    user_text = f"{user_profile.major} {user_profile.interests} {user_profile.skills}"
    club_texts = [f"{club.tags} {club.description}" for club in all_clubs]
    corpus = [user_text] + club_texts
    
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)
    cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    club_scores = list(zip(all_clubs, cosine_similarities))
    club_scores.sort(key=lambda x: x[1], reverse=True)
    
    top_n = 5
    recommended_clubs = []
    for club, score in club_scores[:top_n]:
        recommended_clubs.append({
            "id": club.id,
            "name": club.name,
            "description": club.description,
            "score": float(score)
        })

    return jsonify({"recommendations": recommended_clubs}), 200

@app.route("/checkin/<string:qr_code_key>/<int:user_id>", methods=["POST"])
def checkin(qr_code_key, user_id):
    event = Event.query.filter_by(qr_code_key=qr_code_key).first()
    user = User.query.get(user_id)

    if not event:
        return jsonify({"message": "Invalid QR code. Event not found."}), 404
    
    if not user:
        return jsonify({"message": "Invalid user ID."}), 404
    
    if Attendance.query.filter_by(event_id=event.id, student_id=user.id).first():
        return jsonify({"message": "You are already checked in to this event."}), 409
    
    new_attendance = Attendance(event_id=event.id, student_id=user.id)
    
    try:
        db.session.add(new_attendance)
        db.session.commit()
        return jsonify({"message": f"Successfully checked in to {event.name}!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@app.route("/events/<int:event_id>/attendees", methods=["GET"])
def get_event_attendees(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found."}), 404
    
    attendances = Attendance.query.filter_by(event_id=event.id).all()
    attendees_list = []
    for attendance in attendances:
        user = User.query.get(attendance.student_id)
        if user:
            attendees_list.append({
                "student_id": user.id,
                "student_name": user.full_name,
                "timestamp": attendance.timestamp.isoformat()
            })
    
    return jsonify({"event_name": event.name, "attendees": attendees_list}), 200

@app.route("/generate_qr/<int:event_id>", methods=["GET"])
def generate_qr(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404

    qr_data = event.qr_code_key
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return jsonify({"image_base64": img_str}), 200

@app.route("/clubs/coordinator/<int:coordinator_id>", methods=["GET"])
def get_club_by_coordinator(coordinator_id):
    club = Club.query.filter_by(coordinator_id=coordinator_id).first()
    if not club:
        return jsonify({"message": "Club not found for this coordinator."}), 404
    return jsonify({
        "id": club.id,
        "name": club.name,
        "description": club.description,
        "tags": club.tags.split(',') if club.tags else [],
        "deadline": club.deadline.isoformat() if club.deadline else None,
        "contact_info": club.contact_info,
        "is_recruiting": club.is_recruiting,
        "open_positions": club.open_positions.split(',') if club.open_positions else [],
        "skills_required": club.skills_required.split(',') if club.skills_required else [],
        "total_members": club.total_members,
        "interview_date": club.interview_date.isoformat() if club.interview_date else None
    })

@app.route("/clubs/<int:club_id>/events", methods=["GET"])
def get_club_events(club_id):
    club = Club.query.get(club_id)
    if not club:
        return jsonify({"message": "Club not found."}), 404
    
    events = Event.query.filter_by(club_id=club_id).order_by(Event.date).all()
    event_list = [{
        "id": event.id,
        "name": event.name,
        "date": event.date.isoformat(),
        "location": event.location
    } for event in events]
    return jsonify({"events": event_list}), 200

# ---  Chatbot Endpoint ---
chatbot_intents = {
    "greetings": {
        "patterns": ["hello", "hi", "hey", "greetings"],
        "responses": ["Hello! How can I help you with club recruitment today?", "Hi there! I can answer questions about clubs, events, and how to join."]
    },
    "club_info": {
        "patterns": ["clubs", "societies", "list clubs", "find societies", "what clubs are there"],
        "responses": ["You can find a list of all clubs in the Club Directory tab. You can filter them by category or use the search bar to find something specific!"]
    },
    "event_info": {
        "patterns": ["events", "what's on", "schedule", "upcoming events", "events list"],
        "responses": ["Check the Home page for a list of all upcoming events from our clubs. We update it frequently!"]
    },
    "join_club": {
        "patterns": ["how to join", "join a club", "apply", "membership"],
        "responses": ["To join a club, you can usually apply through their page, or you can attend an event to meet the members and talk to the coordinator."]
    },
    "thank_you": {
        "patterns": ["thank you", "thanks", "appreciate it"],
        "responses": ["You're welcome! Happy to help.", "Glad I could assist!"]
    },
    "goodbye": {
        "patterns": ["bye", "goodbye", "see you later"],
        "responses": ["Goodbye! Feel free to reach out if you have more questions.", "See you around!"]
    }
}

@app.route("/chatbot", methods=["POST"])
def chatbot_response():
    data = request.get_json()
    user_message = data.get("message", "").lower().strip()

    matched_intent = None
    for intent, data in chatbot_intents.items():
        for pattern in data["patterns"]:
            if re.search(r'\b' + pattern + r'\b', user_message):
                matched_intent = intent
                break
        if matched_intent:
            break

    if matched_intent:
        response = chatbot_intents[matched_intent]["responses"][0]
    else:
        response = "I'm sorry, I don't understand that. You can ask about 'clubs', 'events', or how to 'join' one."
    
    return jsonify({"response": response}), 200

@app.route("/buzz", methods=["GET"])
def get_buzz_data():
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    
    buzz_data = db.session.query(
        Club.name,
        func.count(Attendance.id).label('buzz_score')
    ).select_from(Club).join(Event).join(Attendance).filter(
        Attendance.timestamp >= one_hour_ago
    ).group_by(Club.name).order_by(
        func.count(Attendance.id).desc()
    ).all()
    
    buzz_list = []
    for club_name, score in buzz_data:
        buzz_list.append({"club_name": club_name, "buzz_score": score})
    
    return jsonify({"buzz_data": buzz_list}), 200

@app.route("/user/profile/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    profile = StudentProfile.query.filter_by(user_id=user.id).first()
    
    user_data = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "major": profile.major if profile else None,
        "interests": profile.interests if profile else None,
        "skills": profile.skills if profile else None,
        "personal_details": profile.personal_details if profile else None,
        "profile_complete": bool(profile and profile.major and profile.interests and profile.skills)
    }
    return jsonify(user_data), 200

@app.route("/applications/<int:student_id>", methods=["GET"])
def get_student_applications(student_id):
    applications = Application.query.filter_by(student_id=student_id).all()
    app_list = []
    for app in applications:
        club = Club.query.get(app.club_id)
        app_list.append({
            "id": app.id,
            "club_name": club.name if club else "N/A",
            "status": app.status,
            "timestamp": app.timestamp.isoformat()
        })
    return jsonify(app_list), 200

@app.route("/applications/club/<int:club_id>", methods=["GET"])
def get_club_applications(club_id):
    applications = Application.query.filter_by(club_id=club_id).all()
    app_list = []
    for app in applications:
        student = User.query.get(app.student_id)
        app_list.append({
            "id": app.id,
            "student_name": student.full_name if student else "N/A",
            "student_id": app.student_id,
            "status": app.status,
            "timestamp": app.timestamp.isoformat()
        })
    return jsonify(app_list), 200

@app.route("/feedback/club/<int:club_id>", methods=["GET"])
def get_club_feedback(club_id):
    feedback_entries = Feedback.query.filter_by(club_id=club_id).all()
    feedback_list = []
    for entry in feedback_entries:
        student = User.query.get(entry.student_id)
        feedback_list.append({
            "id": entry.id,
            "student_name": student.full_name if student else "N/A",
            "rating": entry.rating,
            "comment": entry.comment,
            "timestamp": entry.timestamp.isoformat()
        })
    return jsonify(feedback_list), 200

@app.route("/events", methods=["GET"])
def get_events():
    events = Event.query.order_by(Event.date).all()
    event_list = []
    for event in events:
        event_list.append({
            "id": event.id,
            "name": event.name,
            "date": event.date.isoformat(),
            "location": event.location,
            "club_name": event.club.name
        })
    return jsonify(event_list), 200

@app.route("/apply/<int:student_id>/<int:club_id>", methods=["POST"])
def apply_for_club(student_id, club_id):
    student = User.query.get(student_id)
    club = Club.query.get(club_id)
    
    if not student or not club:
        return jsonify({"message": "Student or Club not found"}), 404
        
    existing_application = Application.query.filter_by(student_id=student_id, club_id=club_id).first()
    if existing_application:
        return jsonify({"message": "You have already applied to this club"}), 409
        
    new_application = Application(student_id=student_id, club_id=club_id, status='pending')
    
    try:
        db.session.add(new_application)
        db.session.commit()
        return jsonify({"message": "Application submitted successfully", "status": "pending"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@app.route("/")
def home():
    return "Welcome to the College Club Recruitment Website Backend!"


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not User.query.first():
            hashed_pass = bcrypt.generate_password_hash("password123").decode('utf-8')
            student_user = User(username='johndoe', email='john@example.com', password_hash=hashed_pass, full_name='John Doe', role='student')
            coordinator_user = User(username='janeclub', email='jane@club.com', password_hash=hashed_pass, full_name='Jane Coordinator', role='coordinator')
            db.session.add(student_user)
            db.session.add(coordinator_user)
            db.session.commit()

            student_profile = StudentProfile(user_id=student_user.id, major='Computer Science', interests='AI,Web Development', skills='Python,Flask')
            db.session.add(student_profile)
            
            club_data = [
                {
                    "name": "Axions", 
                    "description": "A high-energy dance club dedicated to all forms of dance.", 
                    "tags": "Arts,Dance,Performance", 
                    "is_recruiting": True, 
                    "open_positions": "Dancers, Choreographers", 
                    "skills_required": "Dancing, Choreography", 
                    "total_members": 30,
                    "interview_date": datetime(2025, 10, 20, 15, 0, 0),
                },
                {
                    "name": "Kalamgiri", 
                    "description": "The literary society of the college, focusing on writing and poetry.", 
                    "tags": "Literary,Arts,Writing", 
                    "is_recruiting": True, 
                    "open_positions": "Writers, Poets, Editors", 
                    "skills_required": "Creative Writing, Public Speaking", 
                    "total_members": 25,
                    "interview_date": datetime(2025, 10, 22, 16, 0, 0),
                },
                {
                    "name": "CSI", 
                    "description": "A technical club for students interested in computer science and programming.", 
                    "tags": "Technical,Computer Science,Programming", 
                    "is_recruiting": False, 
                    "open_positions": "N/A", 
                    "skills_required": "Python, Java, Data Structures", 
                    "total_members": 80,
                    "interview_date": None,
                },
                {
                    "name": "Genesis", 
                    "description": "A society dedicated to innovation and product development.", 
                    "tags": "Technical,Innovation,Engineering", 
                    "is_recruiting": True, 
                    "open_positions": "Engineers, Product Managers", 
                    "skills_required": "Project Management, CAD, Electronics", 
                    "total_members": 50,
                    "interview_date": datetime(2025, 10, 25, 11, 0, 0),
                },
                 {
                    "name": "AI & Robotics Club", 
                    "description": "We build cool robots and AI models.", 
                    "tags": "AI,Robotics,Engineering", 
                    "is_recruiting": True, 
                    "open_positions": "AI Researcher, Robotics Engineer", 
                    "skills_required": "Python, C++, Machine Learning", 
                    "total_members": 45,
                    "interview_date": datetime(2025, 10, 15, 10, 0, 0),
                },
                {
                    "name": "Debate Club",
                    "description": "Sharpen your public speaking and critical thinking.",
                    "tags": "Leadership,Public Speaking,Debate",
                    "is_recruiting": False,
                    "open_positions": "N/A",
                    "skills_required": "Public Speaking, Critical Thinking",
                    "total_members": 20,
                    "interview_date": None
                }
            ]

            for data in club_data:
                club = Club.query.filter_by(name=data["name"]).first()
                if not club:
                    new_club_entry = Club(
                        coordinator_id=coordinator_user.id,
                        **data
                    )
                    db.session.add(new_club_entry)
            
            db.session.commit()

            new_event = Event(club_id=db.session.query(Club.id).filter_by(name="AI & Robotics Club").scalar(), name="AI Workshop", date=datetime.utcnow() + timedelta(days=7), location="Engineering Hall", qr_code_key="ai-workshop-2025")
            db.session.add(new_event)
            db.session.commit()
    
    app.run(debug=True)