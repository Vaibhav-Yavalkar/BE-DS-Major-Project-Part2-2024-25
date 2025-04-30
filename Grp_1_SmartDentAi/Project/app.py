from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, time
import os
from agora_token_builder import RtcTokenBuilder
import random
import time
import subprocess
import sys
from flask import flash, redirect, url_for
from flask_login import login_required
import requests

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dental.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Agora configuration
AGORA_APP_ID = os.getenv('AGORA_APP_ID')
AGORA_APP_CERTIFICATE = os.getenv('AGORA_APP_CERTIFICATE')

if not AGORA_APP_ID or not AGORA_APP_CERTIFICATE:
    print("WARNING: Agora credentials not found in environment variables!")
    print("Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE in your .env file")
    print("You can get these from https://console.agora.io/")
    AGORA_APP_ID = "your_app_id_here"  # Replace with your actual App ID
    AGORA_APP_CERTIFICATE = "your_app_certificate_here"  # Replace with your actual App Certificate

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    is_dentist = db.Column(db.Boolean, default=False)
    specialty = db.Column(db.String(50), nullable=True)
    
    # Relationships
    patient_appointments = db.relationship('Appointment', 
                                         foreign_keys='Appointment.patient_id',
                                         backref='patient', 
                                         lazy=True)
    dentist_appointments = db.relationship('Appointment', 
                                         foreign_keys='Appointment.dentist_id',
                                         backref='dentist', 
                                         lazy=True)
    video_call_requests = db.relationship('VideoCallRequest',
                                        foreign_keys='VideoCallRequest.patient_id',
                                        backref='patient',
                                        lazy=True)
    dentist_video_calls = db.relationship('VideoCallRequest',
                                        foreign_keys='VideoCallRequest.dentist_id',
                                        backref='dentist',
                                        lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    dentist_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)
    is_video_call = db.Column(db.Boolean, default=False)
    video_call_room = db.Column(db.String(50), nullable=True)

class VideoCallRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    dentist_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    specialty = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    scheduled_time = db.Column(db.DateTime, nullable=True)
    video_call_room = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        is_dentist = request.form.get('is_dentist') == 'on'
        specialty = request.form.get('specialty') if is_dentist else None

        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists')
            return redirect(url_for('register'))

        user = User(username=username, email=email, is_dentist=is_dentist, specialty=specialty)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! Please login.')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('dashboard'))
        
        flash('Invalid username or password')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.is_dentist:
        appointments = Appointment.query.filter_by(dentist_id=current_user.id).all()
        video_calls = VideoCallRequest.query.filter_by(dentist_id=current_user.id).all()
    else:
        appointments = Appointment.query.filter_by(patient_id=current_user.id).all()
        video_calls = VideoCallRequest.query.filter_by(patient_id=current_user.id).all()
    
    return render_template('dashboard.html', 
                         appointments=appointments,
                         video_calls=video_calls,
                         is_dentist=current_user.is_dentist,
                         current_user=current_user)

@app.route('/book_appointment', methods=['GET', 'POST'])
@login_required
def book_appointment():
    if request.method == 'POST':
        dentist_id = request.form.get('dentist_id')
        date = datetime.strptime(request.form.get('date'), '%Y-%m-%d').date()
        time_str = request.form.get('time')
        time_obj = datetime.strptime(time_str, '%H:%M').time()
        notes = request.form.get('notes')
        
        appointment = Appointment(
            patient_id=current_user.id,
            dentist_id=dentist_id,
            date=date,
            time=time_obj,
            notes=notes
        )
        db.session.add(appointment)
        db.session.commit()
        flash('Appointment booked successfully!')
        return redirect(url_for('dashboard'))
    
    specialties = sorted(set(d.specialty for d in User.query.filter_by(is_dentist=True).all()))
    dentists = User.query.filter_by(is_dentist=True).all()
    
    return render_template('book_appointment.html', 
                         dentists=dentists,
                         specialties=specialties,
                         now=datetime.now())

@app.route('/request_video_call', methods=['GET', 'POST'])
@login_required
def request_video_call():
    if request.method == 'POST':
        dentist_id = request.form.get('dentist_id')
        specialty = request.form.get('specialty')
        notes = request.form.get('notes')
        
        # Create video call request
        video_call = VideoCallRequest(
            patient_id=current_user.id,
            dentist_id=dentist_id,
            specialty=specialty,
            notes=notes
        )
        db.session.add(video_call)
        db.session.commit()
        flash('Video call request submitted successfully!')
        return redirect(url_for('dashboard'))
    
    specialties = sorted(set(d.specialty for d in User.query.filter_by(is_dentist=True).all()))
    dentists = User.query.filter_by(is_dentist=True).all()
    return render_template('request_video_call.html', 
                         specialties=specialties,
                         dentists=dentists)

@app.route('/video_call/<int:call_id>/approve', methods=['POST'])
@login_required
def approve_video_call(call_id):
    video_call = VideoCallRequest.query.get_or_404(call_id)
    if video_call.dentist_id != current_user.id:
        flash('You are not authorized to approve this video call')
        return redirect(url_for('dashboard'))
    
    video_call.status = 'approved'
    video_call.scheduled_time = datetime.strptime(
        request.form.get('scheduled_time'),
        '%Y-%m-%dT%H:%M'
    )
    video_call.video_call_room = f"dental_video_{video_call.id}"
    db.session.commit()
    flash('Video call approved successfully!')
    return redirect(url_for('dashboard'))

@app.route('/video_call/<int:call_id>/reject', methods=['POST'])
@login_required
def reject_video_call(call_id):
    video_call = VideoCallRequest.query.get_or_404(call_id)
    if video_call.dentist_id != current_user.id:
        flash('You are not authorized to reject this video call')
        return redirect(url_for('dashboard'))
    
    video_call.status = 'rejected'
    db.session.commit()
    flash('Video call rejected')
    return redirect(url_for('dashboard'))

@app.route('/video_call/<int:call_id>')
@login_required
def video_call(call_id):
    video_call = VideoCallRequest.query.get_or_404(call_id)
    
    # Check if user is authorized to access this video call
    if current_user.id not in [video_call.patient_id, video_call.dentist_id]:
        flash('You are not authorized to access this video call')
        return redirect(url_for('dashboard'))
    
    # Check if video call is approved
    if video_call.status != 'approved':
        flash('This video call has not been approved yet')
        return redirect(url_for('dashboard'))
    
    return render_template('video_call.html', 
                         video_call=video_call,
                         agora_app_id=AGORA_APP_ID)

@app.route('/generate_token', methods=['POST'])
@login_required
def generate_token():
    try:
        channel_name = request.json.get('channel_name')
        if not channel_name:
            return jsonify({'error': 'Channel name is required'}), 400
        
        if not AGORA_APP_ID or not AGORA_APP_CERTIFICATE:
            print("Error: Agora credentials not configured")
            return jsonify({'error': 'Agora credentials not configured'}), 500
        
        # Generate a random uid
        uid = random.randint(1, 230)
        # Set token expiration time in seconds (1 hour)
        expiration_time_in_seconds = 3600
        # Get current timestamp
        current_timestamp = int(time.time())
        # Calculate privilege expiration time
        privilege_expired_ts = current_timestamp + expiration_time_in_seconds
        
        print(f"Generating token for channel: {channel_name}")
        print(f"Using App ID: {AGORA_APP_ID}")
        
        # Build token with uid
        token = RtcTokenBuilder.buildTokenWithUid(
            AGORA_APP_ID, 
            AGORA_APP_CERTIFICATE, 
            channel_name, 
            uid, 
            1,  # Role: 1 for publisher
            privilege_expired_ts
        )
        
        print("Token generated successfully")
        return jsonify({
            'token': token,
            'uid': uid,
            'appId': AGORA_APP_ID
        })
    except Exception as e:
        print(f"Error generating token: {str(e)}")
        return jsonify({'error': f'Failed to generate token: {str(e)}'}), 500

@app.route('/ai_treatment')
@login_required
def ai_treatment():
    return render_template('ai_treatment.html')

@app.route('/appointment/<int:appointment_id>/approve', methods=['POST'])
@login_required
def approve_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    if appointment.dentist_id != current_user.id:
        flash('You are not authorized to approve this appointment')
        return redirect(url_for('dashboard'))
    
    appointment.status = 'approved'
    db.session.commit()
    flash('Appointment approved successfully!')
    return redirect(url_for('dashboard'))

@app.route('/appointment/<int:appointment_id>/reject', methods=['POST'])
@login_required
def reject_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    if appointment.dentist_id != current_user.id:
        flash('You are not authorized to reject this appointment')
        return redirect(url_for('dashboard'))
    
    appointment.status = 'rejected'
    db.session.commit()
    flash('Appointment rejected')
    return redirect(url_for('dashboard'))


@app.route('/run_oral_treatment', methods=['GET','POST'])
@login_required
def run_oral_treatment():
    return redirect("http://localhost:5002")


@app.route('/run_ortho_treatment', methods=['GET','POST'])
@login_required
def run_ortho_treatment():
    return redirect("http://localhost:5006")


@app.route('/run_xray_treatment', methods=['GET','POST'])
@login_required
def run_xray_treatment():
    return redirect("http://localhost:5003")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Add sample dentists if none exist
        if not User.query.filter_by(is_dentist=True).first():
            dentists = [
                {'username': 'dr_smith', 'email': 'dr.smith@dentalcare.com', 'specialty': 'General Dentistry'},
                {'username': 'dr_johnson', 'email': 'dr.johnson@dentalcare.com', 'specialty': 'Orthodontics'},
                {'username': 'dr_williams', 'email': 'dr.williams@dentalcare.com', 'specialty': 'Periodontics'},
                {'username': 'dr_brown', 'email': 'dr.brown@dentalcare.com', 'specialty': 'Endodontics'},
                {'username': 'dr_davis', 'email': 'dr.davis@dentalcare.com', 'specialty': 'Oral Surgery'},
                {'username': 'dr_miller', 'email': 'dr.miller@dentalcare.com', 'specialty': 'Pediatric Dentistry'}
            ]
            
            for dentist_data in dentists:
                dentist = User(
                    username=dentist_data['username'],
                    email=dentist_data['email'],
                    is_dentist=True,
                    specialty=dentist_data['specialty']
                )
                dentist.set_password('dentist123')  # Set a default password
                db.session.add(dentist)
            
            db.session.commit()
            print("Sample dentists added to the database.")
    
    app.run(debug=True) 