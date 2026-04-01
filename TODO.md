# Full-Stack Setup & Deployment TODO for Club Recruitment Project

## Backend Setup (Approved Plan Steps)

### 1. [ ] Create Python virtual environment
   Command: `python3 -m venv venv`

### 2. [ ] Activate virtual environment
   Command: `source venv/bin/activate`

### 3. [ ] Install Python dependencies
   Command: `pip install Flask Flask-SQLAlchemy Flask-Bcrypt scikit-learn nltk qrcode[pil] flask-cors`

### 4. [ ] Run Flask backend server
   Command: `python app.py`
   - Expected: Server runs on http://127.0.0.1:5000
   - Auto-creates instance/site.db with dummy data if needed
   - Test: Visit http://127.0.0.1:5000/clubs or curl

### 5. [ ] Verify backend integration with frontend
   - Frontend at http://localhost:3000 should proxy API calls
   - Demo: Use user ID=1 (student), ID=2 (coordinator); pass='password123'

## Frontend Setup (React App)

### 6. [ ] Install Node.js dependencies
   Command: `npm install`
   - Runs in project root (package.json exists)

### 7. [ ] Run React development server
   Command: `npm start`
   - Expected: Opens http://localhost:3000 automatically
   - Proxies API to backend :5000 (check src/setupProxy.js if issues)

### 8. [ ] Verify full-stack integration
   - Backend server (:5000) must run first
   - Test frontend features: HomePage, Login/Register, StudentDashboard, ClubDirectory
   - Use dummy data: Login as student (ID=1, pass='password123')

### 9. [ ] [COMPLETE] Stop servers when done
   - Backend: Ctrl+C in venv terminal, then `deactivate`
   - Frontend: Ctrl+C in npm terminal

## Vercel Deployment (Frontend Only - Backend Needs Separate Hosting)

### 10. [ ] Install Vercel CLI globally
    Command: `npm install -g vercel`

### 11. [ ] .gitignore updated (ignores node_modules, instance/, venv/)

### 12. [ ] Build frontend for production
    Command: `npm run build`

### 13. [ ] Deploy to Vercel
    Commands:
    ```
    vercel
    # Follow prompts: select project, link GitHub, deploy
    # Auto-detects React/static site
    ```

### 14. [ ] Backend & Data Persistence (Separate)
    **Option 1: Supabase (Recommended - Free Postgres)**
    1. Sign up: https://supabase.com
    2. New project → Get DB URI (postgresql://...)
    3. Update app.py: `SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///site.db')`
    4. Deploy backend: Railway/Heroku (`vercel` frontend-only)
    5. Update frontend API base URL env var.

    **Local test:** Keep SQLite, deploy frontend only (connect via CORS).

**Notes:**
- Vercel: Frontend static (localhost:3000 → your-vercel-app.vercel.app)
- Backend: Railway.app (free tier) for Flask + Supabase DB.
- No project files affected; .gitignore prevents local files upload.
- Dummy data auto-creates on first run.
