import os
import pathlib
import re
import tempfile
from urllib.parse import quote_plus
import threading
import time
import pyautogui
import numpy as np
import pandas as pd
import threading
import time
import pymysql
import cv2
import pyaudio
import wave
import moviepy.editor as mp
import keyboard
import pdfplumber
import streamlit as st
import google.generativeai as genai
from sqlalchemy import create_engine, MetaData
import pygetwindow as gw
from pywinauto.application import Application
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))  # Ensure API Key is set

def process_uploaded_files(uploaded_files):
    file_metadata = []
    for uploaded_file in uploaded_files:
        file_path = pathlib.Path(uploaded_file.name)
        file_path.write_bytes(uploaded_file.getvalue())  # Save file locally

        metadata = genai.upload_file(
            path=file_path,
            mime_type="application/pdf" if uploaded_file.type == "application/pdf" else "text/plain",
        )
        file_metadata.append(metadata)

    return file_metadata
def generate_rag_response(file_metadata, query):
    if not file_metadata or not query:
        return "No valid input provided."
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content([*file_metadata, query])
    return response.text
# Streamlit UI Setup
st.set_page_config(page_title="LUMIS - LLM-based Unified Multimodal Intelligent System", layout="wide")
st.title("LUMIS - LLM-Powered Assistance")

# Sidebar: Task Selection
st.sidebar.title("Choose Task")
task = st.sidebar.selectbox(
    "Select task:",
    ["YouTube Video Transcription & Summarization", "Image & Text Processing", "Chatbot", "Summarize Multiple PDFs",  "T.A.P.A.S", "S.Q.L.A.G.E"]  
)

### 📌 1️⃣ YouTube Video Processing
def process_youtube_video(youtube_url):
    try:
        video_id = youtube_url.split("v=")[-1].split("&")[0]
        transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = " ".join([item['text'] for item in transcript_data])

        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(f"Summarize this transcript:\n{transcript_text}")
        return response.text
    except (TranscriptsDisabled, NoTranscriptFound):
        return "❌ No transcript available for this video."
    except Exception as e:
        return f"❌ Error: {str(e)}"

### 📌 2️⃣ Image & Text Processing
def process_image_text(text_input=None, image_file=None):
    model = genai.GenerativeModel('gemini-1.5-flash')
    if text_input and image_file:
        image = Image.open(image_file)
        response = model.generate_content([f"Analyze this image and text:\n{text_input}", image])
    elif image_file:
        image = Image.open(image_file)
        response = model.generate_content(["Analyze this image:", image])
    elif text_input:
        response = model.generate_content(f"Analyze this text:\n{text_input}")
    else:
        return "Please provide either text or an image."
    return response.text

### 📌 3️⃣ General Chatbot
def chatbot_tasks(user_input):
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(f"Answer this query:\n{user_input}")
    return response.text

### 📌 4️⃣ RAG (Retrieval-Augmented Generation) for Multiple Files
def summarize_pdfs(uploaded_files):
    model = genai.GenerativeModel("gemini-1.5-flash")
    summaries = {}
    for uploaded_file in uploaded_files:
        with pdfplumber.open(uploaded_file) as pdf:
            pdf_text = " ".join(page.extract_text() for page in pdf.pages if page.extract_text())
        response = model.generate_content(f"Summarize this document:\n{pdf_text}")
        summaries[uploaded_file.name] = response.text
    return summaries

### 📌 5️⃣ Screen & Audio Recording
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
audio_filename = "output.wav"
video_filename = "output.mp4"
final_filename = "final_output.mp4"

def cleanup_files():
    """Deletes old files before recording starts."""
    for file in [audio_filename, video_filename, final_filename]:
        if os.path.exists(file):
            os.remove(file)

import keyboard  
def record_audio(filename, stop_event):
    audio = pyaudio.PyAudio()
    stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)
    
    frames = []
    while not stop_event.is_set():
        try:
            data = stream.read(CHUNK, exception_on_overflow=False)
            frames.append(data)
        except IOError as e:
            print(f"Audio recording error: {e}")
            break  # Exit on error

        # Check if 'Q' is pressed
        if keyboard.is_pressed('q'):
            stop_event.set()
    
    stream.stop_stream()
    stream.close()
    audio.terminate()

    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(audio.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))



def record_screen(filename, stop_event):
    screen_size = pyautogui.size()
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(filename, fourcc, 8, (screen_size.width, screen_size.height))
    while not stop_event.is_set():
        frame = np.array(pyautogui.screenshot())
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        out.write(frame)
    out.release()

def combine_audio_video():
    video_clip = mp.VideoFileClip(video_filename)
    audio_clip = mp.AudioFileClip(audio_filename)
    video_clip.set_audio(audio_clip).write_videofile(final_filename, codec='libx264')

def run_genai_logic_audio(audio_file):
    model = genai.GenerativeModel("gemini-1.5-flash")
    my_audio_file = genai.upload_file(path=audio_file)
    
    while my_audio_file.state.name == "PROCESSING":
        time.sleep(5)
        my_audio_file = genai.get_file(my_audio_file.name)
    
    prompt = "Understand the audio and convert the audio into text."
    response = model.generate_content([my_audio_file, prompt])
    return response.text

def route_based_on_classification(transcribed_text, video_file):
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"""
    1. **Explanation of the Error**: Analyze the video '{video_file}' and the spoken issue '{transcribed_text}' to identify the specific problem in the code line. Clearly explain the cause of the error.
    2. **Approach to Solve the Error**: Outline the steps needed to resolve the error, focusing on the necessary code changes or adjustments.
    3. **Corrected Code**: Provide the corrected version of the code that addresses the identified issue.
    4. **Summary**: Conclude with a brief summary of the solution, emphasizing the key points and how the changes fix the problem.
    """

    my_video_file = genai.upload_file(path=video_file)
    while my_video_file.state.name == "PROCESSING":
        time.sleep(5)
        my_video_file = genai.get_file(my_video_file.name)
    
    video_response = model.generate_content([my_video_file, prompt])
    return video_response.text

# 🔹 **Task Execution**
if task == "YouTube Video Transcription & Summarization":
    youtube_url = st.text_input("Enter YouTube Video URL")
    if youtube_url:
        st.subheader("Summary")
        st.write(process_youtube_video(youtube_url))

elif task == "Image & Text Processing":
    text_input = st.text_area("Enter text (optional)")
    image_file = st.file_uploader("Upload an Image (optional)", type=["jpg", "png", "jpeg"])
    if text_input or image_file:
        st.subheader("AI Response")
        st.write(process_image_text(text_input, image_file))

elif task == "Chatbot":
    user_input = st.text_area("Enter your query")
    if user_input:
        st.subheader("AI Response")
        st.write(chatbot_tasks(user_input))

elif task == "Summarize Multiple PDFs":
    uploaded_files = st.file_uploader("Upload files (PDF, TXT)", type=["pdf", "txt"], accept_multiple_files=True)
    query = st.text_input("Enter your query related to the documents")
    
    if uploaded_files and query:
        file_metadata = process_uploaded_files(uploaded_files)
        response = generate_rag_response(file_metadata, query)
        st.subheader("AI Response")
        st.write(response)

elif task == "T.A.P.A.S":
    stop_event = threading.Event()
    
    if st.button("Start Recording"):
        cleanup_files()
        audio_thread = threading.Thread(target=record_audio, args=(audio_filename, stop_event))
        screen_thread = threading.Thread(target=record_screen, args=(video_filename, stop_event))
        audio_thread.start()
        screen_thread.start()
        st.write("Recording started... Press 'Q' to stop.")
        
        # Continuously check if stop_event is set (to update UI)
        while not stop_event.is_set():
            time.sleep(1)  # Prevent excessive CPU usage

        audio_thread.join()
        screen_thread.join()
        combine_audio_video()
        st.success("Recording Completed! Analyzing...")
        st.write(route_based_on_classification(run_genai_logic_audio(audio_filename), video_filename))

elif task == "S.Q.L.A.G.E":
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_HOST = os.getenv('DB_HOST')
    DB_NAME = os.getenv('DB_NAME')
    genai_api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
    encoded_password = quote_plus(DB_PASSWORD)
    genai.configure(api_key=genai_api_key)
    model = genai.GenerativeModel(model_name = 'gemini-1.5-flash')

    # Create the engine using the environment variables
    engine = create_engine(f'mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}')

    # Function to fetch column and table names
    def fetch_table_and_column_names(engine):
        metadata = MetaData()
        metadata.reflect(bind=engine)
        
        table_column_info = {}
        
        for table_name in metadata.tables.keys():
            table = metadata.tables[table_name]
            columns = [column.name for column in table.columns]
            table_column_info[table_name] = columns
        
        return table_column_info

    table_column_info = fetch_table_and_column_names(engine)

    formatted_table_info = "\n".join(
        [f"Table: {table}\nColumns:\n" + "\n".join([f"  - {col}" for col in cols]) for table, cols in table_column_info.items()]
    )
    def get_gemini_sql_query(user_text):
        input_prompt = f""" 
            1.Generate only most accurate MySQL query based on the {user_text}.
            2.Use the provided {formatted_table_info} for table structures and column details.
            3.Focus on creating accurate and MySQL-compatible query.
            4.Apply advanced techniques like joins, subqueries, aggregations, and groupings as needed.
            5.Avoid explanations—deliver only the required SQL query.
        """
        ai_response = model.generate_content([input_prompt, user_text])
        return ai_response.text
    def clean_sql_query(query):
        query = query.strip().strip("```sql").strip("```")
        query = re.sub(r'\bmysql\b', '', query, flags=re.IGNORECASE)
        return query
    user_query = st.text_input("Enter your SQL query or question here:")
    if st.button("Submit"):
        if user_query:
            start_time = time.time()
            generated_sql_query = get_gemini_sql_query(user_query)
            cleaned_sql_query = clean_sql_query(generated_sql_query)
            st.write("Generated SQL Query:")
            st.code(cleaned_sql_query, language='sql')
            try:
                df = pd.read_sql_query(cleaned_sql_query, engine)
                st.write("Query Results:")
                st.dataframe(df)    
                end_time = time.time()
                execution_time = end_time - start_time
                st.write(f"Time taken to generate and execute the query: {execution_time:.4f} seconds")

            except Exception as e:
                st.error(f"Error executing query: {e}")
        else:
            st.warning("Please enter a SQL query or question before submitting.")