import tkinter as tk
from tkinter import ttk, messagebox
import cv2
import numpy as np
import threading
from PIL import Image, ImageTk
import torch
from ultralytics import YOLO
import dlib 
import winsound 
from scipy.spatial import distance
import time

import pyttsx3





# ---------- Global Control Flags ----------
drowsiness_running = False
collision_running = False
pothole_lane_running = False

# ---------- Collision Detection Setup ----------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
vehicle_model = torch.hub.load("ultralytics/yolov5", "yolov5s")
vehicle_model.conf = 0.5
vehicle_model.iou = 0.5
if device.type == 'cuda':
    vehicle_model.half()

FRAME_WIDTH = 640
FRAME_HEIGHT = 480
REFERENCE_CENTER_X = FRAME_WIDTH // 2
REFERENCE_Y_THRESHOLD = FRAME_HEIGHT - 200
REFERENCE_BOX = (REFERENCE_CENTER_X - 250, REFERENCE_Y_THRESHOLD - (-40), REFERENCE_CENTER_X + 250, FRAME_HEIGHT)

# ---------- Isometric Trapezoid Mask ----------
def apply_isometric_trapezoid_mask(frame):
    height, width = frame.shape[:2]
    top_width = int(width * 0.7)
    bottom_width = int(width * 0.95)
    top_y = int(height * 0.4)
    bottom_y = height - 30

    points = np.array([[
        [(width - bottom_width) // 2, bottom_y],
        [(width - top_width) // 2, top_y],
        [(width + top_width) // 2, top_y],
        [(width + bottom_width) // 2, bottom_y]
    ]], dtype=np.int32)

    mask = np.zeros_like(frame)
    cv2.fillPoly(mask, points, (255, 255, 255))
    masked = cv2.bitwise_and(frame, mask)
    return masked, points

# ---------- Drowsiness Detection ----------
# Load dlib face detector and shape predictor
predictor_path = "shape_predictor_68_face_landmarks.dat"
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(predictor_path)

# Voice engine setup
engine = pyttsx3.init()
engine.setProperty('rate', 150)
engine.setProperty('voice', engine.getProperty('voices')[1].id)  # Optional: female voice

# Voice alerts
def speak_drowsy():
    engine.say("Drowsiness detected. Please stay alert.")
    engine.runAndWait()

def speak_yawn():
    engine.say("You seem to be yawning. Please take a break.")
    engine.runAndWait()

# EAR calculation
def calculate_EAR(eye):
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

# MAR calculation
def calculate_MAR(mouth):
    A = distance.euclidean(mouth[1], mouth[7])  # 61, 67
    B = distance.euclidean(mouth[2], mouth[6])  # 62, 66
    C = distance.euclidean(mouth[0], mouth[4])  # 60, 64
    mar = (A + B) / (2.0 * C)
    return mar


# Facial landmark indices
LEFT_EYE = list(range(36, 42))
RIGHT_EYE = list(range(42, 48))
MOUTH = list(range(60, 68))

def drowsiness_detection():
    cap = cv2.VideoCapture(0)
    drowsy_start = None
    drowsy_alerted = False
    yawn_alerted = False

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)

        for face in faces:
            shape = predictor(gray, face)
            landmarks = np.array([[p.x, p.y] for p in shape.parts()])

            # EAR calculation
            left_eye = landmarks[LEFT_EYE]
            right_eye = landmarks[RIGHT_EYE]
            ear = (calculate_EAR(left_eye) + calculate_EAR(right_eye)) / 2.0

            # MAR calculation
            mouth = landmarks[MOUTH]
            mar = calculate_MAR(mouth)

            # Draw eye landmarks
            for (x, y) in np.concatenate((left_eye, right_eye), axis=0):
                cv2.circle(frame, (x, y), 2, (0, 255, 0), -1)

            # Draw mouth landmarks
            for (x, y) in mouth:
                cv2.circle(frame, (x, y), 2, (255, 0, 255), -1)

            # Drowsiness detection
            if ear < 0.26:
                if drowsy_start is None:
                    drowsy_start = time.time()
                    drowsy_alerted = False

                elapsed = time.time() - drowsy_start
                if elapsed > 2 and not drowsy_alerted:
                    cv2.putText(frame, "DROWSINESS ALERT!", (50, 100),
                                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 4)
                    speak_drowsy()
                    drowsy_alerted = True
            else:
                drowsy_start = None
                drowsy_alerted = False

            # Yawning detection
            if mar > 0.6 and not yawn_alerted:
                cv2.putText(frame, "YAWNING ALERT!", (50, 150),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 0, 0), 4)
                speak_yawn()
                yawn_alerted = True
            elif mar <= 0.6:
                yawn_alerted = False

            # Display EAR and MAR
            cv2.putText(frame, f"EAR: {ear:.2f}", (30, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
            cv2.putText(frame, f"MAR: {mar:.2f}", (30, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

        cv2.imshow("Drowsiness + Yawning Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
















# ---------- Enhancement Function ----------
def enhance_frame(frame):
    frame = np.clip(frame.astype(np.float32), 0, 255)
    alpha = 1.2
    beta = 20
    enhanced = cv2.convertScaleAbs(frame, alpha=alpha, beta=beta)
    kernel = np.array([[0, -1, 0],
                       [-1, 5, -1],
                       [0, -1, 0]])
    enhanced = cv2.filter2D(enhanced, -1, kernel)
    return enhanced

# ---------- Main Application ----------
class AIDetectionApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Drive Safe with AI Assistant")
        self.root.geometry("1024x720")
        self.root.configure(bg="#1f1f2e")

        self.username = "admin"
        self.password = "admin123"
        self.image_label = None
        self.collision_label = None

        # Create frame references for features
        self.drowsiness_frame = None
        self.collision_frame = None 
        self.pothole_lane_frame = None

        self.login_screen()

    def login_screen(self):
        self.clear_window()

        login_frame = ttk.Frame(self.root, padding=30)
        login_frame.place(relx=0.5, rely=0.5, anchor=tk.CENTER)

        ttk.Label(login_frame, text="Login", font=("Helvetica", 20)).pack(pady=20)

        ttk.Label(login_frame, text="Username:").pack()
        self.username_entry = ttk.Entry(login_frame)
        self.username_entry.pack()

        ttk.Label(login_frame, text="Password:").pack()
        self.password_entry = ttk.Entry(login_frame, show="*")
        self.password_entry.pack()

        ttk.Button(login_frame, text="Login", command=self.check_login).pack(pady=20)

    def check_login(self):
        user = self.username_entry.get()
        pwd = self.password_entry.get()

        if user == self.username and pwd == self.password:
            self.main_screen()
        else:
            messagebox.showerror("Login Failed", "Invalid username or password")

    def main_screen(self):
        self.clear_window()

        top_frame = tk.Frame(self.root, bg="#1f1f2e")
        top_frame.pack(pady=20)

        tk.Label(top_frame, text="AI Detection Dashboard", font=("Helvetica", 24), bg="#1f1f2e", fg="white").pack()

        button_frame = tk.Frame(self.root, bg="#1f1f2e")
        button_frame.pack(pady=10)

        style = ttk.Style()
        style.configure("TButton", font=("Helvetica", 12), padding=10)
        style.configure("Stop.TButton", background="red")

        # Create feature frames
        self.drowsiness_frame = tk.Frame(button_frame, bg="#1f1f2e")
        self.drowsiness_frame.grid(row=0, column=0, padx=20, pady=10)
        
        self.pothole_lane_frame = tk.Frame(button_frame, bg="#1f1f2e")
        self.pothole_lane_frame.grid(row=0, column=1, padx=20, pady=10)
        
        self.collision_frame = tk.Frame(button_frame, bg="#1f1f2e")
        self.collision_frame.grid(row=0, column=2, padx=20, pady=10)

        # Add start buttons for each feature
        ttk.Button(self.drowsiness_frame, text="Start Drowsiness Detection", 
                  command=self.start_drowsiness_thread).pack(pady=5)
        
        ttk.Button(self.pothole_lane_frame, text="Start Lane & Pothole Detection", 
                  command=self.start_pothole_lane_thread).pack(pady=5)
        
        ttk.Button(self.collision_frame, text="Start Collision Detection", 
                  command=self.start_collision_detection_thread).pack(pady=5)

        # Add logout button
        ttk.Button(button_frame, text="Logout", command=self.login_screen).grid(row=1, column=1, padx=20, pady=20)

        # Create image display area
        self.collision_label = tk.Label(self.root, bg="#1f1f2e")
        self.collision_label.pack(pady=20)

    def start_drowsiness_thread(self):
        global drowsiness_running
        if not drowsiness_running:
            # Clear previous stop button if exists
            for widget in self.drowsiness_frame.winfo_children():
                if "stop" in widget.cget("text").lower():
                    widget.destroy()
                else:
                    widget.config(state=tk.DISABLED)
            
            # Add stop button
            stop_btn = ttk.Button(self.drowsiness_frame, text="Stop Drowsiness Detection", 
                                 command=self.stop_drowsiness, style="Stop.TButton")
            stop_btn.pack(pady=5)
            
            threading.Thread(target=drowsiness_detection, daemon=True).start()

    def stop_drowsiness(self):
        global drowsiness_running
        drowsiness_running = False
        
        # Remove stop button and re-enable start button
        for widget in self.drowsiness_frame.winfo_children():
            if "stop" in widget.cget("text").lower():
                widget.destroy()
            else:
                widget.config(state=tk.NORMAL)

    def start_collision_detection_thread(self):
        global collision_running
        if not collision_running:
            # Clear previous stop button if exists
            for widget in self.collision_frame.winfo_children():
                if "stop" in widget.cget("text").lower():
                    widget.destroy()
                else:
                    widget.config(state=tk.DISABLED)
            
            # Add stop button
            stop_btn = ttk.Button(self.collision_frame, text="Stop Collision Detection", 
                                 command=self.stop_collision_detection, style="Stop.TButton")
            stop_btn.pack(pady=5)
            
            collision_running = True
            threading.Thread(target=self.run_collision_detection, daemon=True).start()

    def stop_collision_detection(self):
        global collision_running
        collision_running = False
        
        # Remove stop button and re-enable start button
        for widget in self.collision_frame.winfo_children():
            if "stop" in widget.cget("text").lower():
                widget.destroy()
            else:
                widget.config(state=tk.NORMAL)

    def run_collision_detection(self):
        global collision_running
        cap = cv2.VideoCapture("dataset2.mp4")

        while cap.isOpened() and collision_running:
            ret, frame = cap.read()
            if not ret:
                break

            frame_resized = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
            enhanced_frame = enhance_frame(frame_resized)

            cv2.rectangle(enhanced_frame, (REFERENCE_BOX[0], REFERENCE_BOX[1]), (REFERENCE_BOX[2], REFERENCE_BOX[3]), (0, 255, 0), 2)
            cv2.putText(enhanced_frame, "Reference Area", (REFERENCE_CENTER_X - 100, REFERENCE_Y_THRESHOLD - 100),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            results = vehicle_model(enhanced_frame)
            detections = results.pandas().xyxy[0]

            for _, row in detections.iterrows():
                if row['name'] in ['car', 'truck', 'bus', 'motorcycle']:
                    x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
                    box = (x1, y1, x2, y2)

                    if self.check_overlap(box, REFERENCE_BOX):
                        cv2.rectangle(enhanced_frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        cv2.putText(enhanced_frame, "Warning: Close to Reference", (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                                
            self.update_image(enhanced_frame)

        cap.release()
        collision_running = False
        
        # Use after method to safely update UI from a non-main thread
        self.root.after(0, self.reset_collision_buttons)
    
    def reset_collision_buttons(self):
        for widget in self.collision_frame.winfo_children():
            if "stop" in widget.cget("text").lower():
                widget.destroy()
            else:
                widget.config(state=tk.NORMAL)








#pothole 


    def start_pothole_lane_thread(self):
        global pothole_lane_running
        if not pothole_lane_running:
            # Clear previous stop button if exists
            for widget in self.pothole_lane_frame.winfo_children():
                if "stop" in widget.cget("text").lower():
                    widget.destroy()
                else:
                    widget.config(state=tk.DISABLED)
            
            # Add stop button
            stop_btn = ttk.Button(self.pothole_lane_frame, text="Stop Lane & Pothole Detection", 
                                 command=self.stop_pothole_lane, style="Stop.TButton")
            stop_btn.pack(pady=5)
            
            pothole_lane_running = True
            threading.Thread(target=self.run_pothole_lane_detection, daemon=True).start()

    def stop_pothole_lane(self):
        global pothole_lane_running
        pothole_lane_running = False
        
        # Remove stop button and re-enable start button
        for widget in self.pothole_lane_frame.winfo_children():
            if "stop" in widget.cget("text").lower():
                widget.destroy()
            else:
                widget.config(state=tk.NORMAL)

    def run_pothole_lane_detection(self):
        global pothole_lane_running
        model = YOLO("best.pt")
        cap = cv2.VideoCapture("E:\major project\Drive_safe\Drive_safe\pothole video-1.mp4")

        while cap.isOpened() and pothole_lane_running:
            ret, frame = cap.read()
            if not ret:
                break

            frame_resized = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))

            # Enhance frame before masking
            enhanced_frame = enhance_frame(frame_resized)

            # Apply isometric trapezoid mask
            masked_frame, points = apply_isometric_trapezoid_mask(enhanced_frame)

            # Draw semi-transparent green overlay
            overlay = enhanced_frame.copy()
            cv2.fillPoly(overlay, points, (0, 255, 0))
            alpha = 0.3
            enhanced_frame = cv2.addWeighted(overlay, alpha, enhanced_frame, 1 - alpha, 0)

            # Run YOLO detection
            results = model(masked_frame, verbose=False)[0]
            annotated = enhanced_frame.copy()

            for result in results.boxes:
                cls_id = int(result.cls[0])
                conf = float(result.conf[0])
                if conf > 0.3:
                    x1, y1, x2, y2 = map(int, result.xyxy[0])
                    center_x = (x1 + x2) // 2
                    center_y = (y1 + y2) // 2
                    if cv2.pointPolygonTest(points[0], (center_x, center_y), False) >= 0:
                        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        cv2.putText(annotated, "POTHOLE IN LANE", (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

            self.update_image(annotated)

        cap.release()
        pothole_lane_running = False
        
        # Use after method to safely update UI from a non-main thread
        self.root.after(0, self.reset_pothole_lane_buttons)
    
    def reset_pothole_lane_buttons(self):
        for widget in self.pothole_lane_frame.winfo_children():
            if "stop" in widget.cget("text").lower():
                widget.destroy()
            else:
                widget.config(state=tk.NORMAL)

    def update_image(self, frame):
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img_pil = Image.fromarray(frame_rgb)
        img_tk = ImageTk.PhotoImage(image=img_pil)

        if self.collision_label:
            self.collision_label.configure(image=img_tk)
            self.collision_label.image = img_tk

    def check_overlap(self, box1, box2):
        x1, y1, x2, y2 = box1
        x3, y3, x4, y4 = box2
        return not (x2 < x3 or x4 < x1 or y2 < y3 or y4 < y1)

    def clear_window(self):
        for widget in self.root.winfo_children():
            widget.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = AIDetectionApp(root)
    root.mainloop()