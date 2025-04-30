import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from scipy.interpolate import make_interp_spline
from PIL import Image, ImageTk
from keras.models import load_model
from keras.preprocessing import image

# -------- Load Data --------
df_climate = pd.read_csv('data/climate.csv')
df_crop_size = pd.read_csv('data/crop_size.csv')
df_market_price = pd.read_csv('data/market_price.csv')
df_soil = pd.read_csv('data/soil.csv')
df_yield = pd.read_csv('data/yield.csv')

# Climate Data Map
climate_crop_data = {str(row['climate_type']).strip("'"): (row['best_crop'], row['expected_yield_kg']) for _, row in df_climate.iterrows()}

# Load model once
disease_model = load_model('leaf_disease_model.h5')

# -------- Tkinter Setup --------

root = tk.Tk()
root.title("Crop Recommendation System")
root.geometry("1100x700")
root.configure(bg='white')
root.state('zoomed')

bg_image = Image.open('bg.jpg')
bg_image = bg_image.resize((1300, 800))
bg_photo = ImageTk.PhotoImage(bg_image)

# -------- Main Frame --------
menu_frame = tk.Frame(root, bg="#2E8B57", width=200)
menu_frame.pack(side="left", fill="y")

content_frame = tk.Frame(root, bg="white")
content_frame.pack(side="right", expand=True, fill="both")

# -------- Navigation Buttons --------
def create_nav_button(text, command):
    return tk.Button(menu_frame, text=text, font=("Arial", 14), bg="#3CB371", fg="white", relief="flat", command=command, pady=10)

buttons = [
    ("Climate Crop Recommendation", lambda: open_page('climate')),
    ("Crop Size Prediction", lambda: open_page('crop_size')),
    ("Market Price Estimation", lambda: open_page('market_price')),
    ("Soil Sustainability", lambda: open_page('soil')),
    ("Yield Prediction", lambda: open_page('yield')),
    ("Leaf Disease Detection", lambda: open_page('leaf_disease')),
]

for (text, cmd) in buttons:
    btn = create_nav_button(text, cmd)
    btn.pack(fill="x", pady=5)

# --------- Reset Content Frame ----------
def reset_frame(page_name):
    for widget in content_frame.winfo_children():
        widget.destroy()

    background_label = tk.Label(content_frame, image=bg_photo)
    background_label.image = bg_photo
    background_label.place(x=0, y=0, relwidth=1, relheight=1)

    header = tk.Label(content_frame, text=page_name, font=("Arial", 24, "bold"), bg="white", fg="#333")
    header.pack(pady=20)

# --------- Pages Implementation --------
def open_page(page_name):
    if page_name == 'climate': climate_crop_page()
    elif page_name == 'crop_size': crop_size_page()
    elif page_name == 'market_price': market_price_page()
    elif page_name == 'soil': soil_sustainability_page()
    elif page_name == 'yield': yield_prediction_page()
    elif page_name == 'leaf_disease': leaf_disease_detection_page()

def climate_crop_page():
    reset_frame("Climate Crop Recommendation")

    season_var = tk.StringVar()
    seasons = list(climate_crop_data.keys())
    season_dropdown = ttk.Combobox(content_frame, textvariable=season_var, values=seasons, font=("Arial", 14), state="readonly")
    season_dropdown.pack(pady=10)
    season_dropdown.set('Select Climate')

    result_label = tk.Label(content_frame, text="", font=("Arial", 16), bg='white')
    result_label.pack(pady=10)

    graph_frame = tk.Frame(content_frame, bg='white')
    graph_frame.pack(pady=20)

    def show_result():
        season = season_var.get()
        if season in climate_crop_data:
            best_crop, yield_kg = climate_crop_data[season]
            result_label.config(text=f"Best Crop: {best_crop}\nExpected Yield: {yield_kg} kg")

            x = np.array([0, 1, 2, 3, 4, 5])
            y = np.array([yield_kg * 0.1, yield_kg * 0.4, yield_kg * 0.8, yield_kg, yield_kg * 0.7, yield_kg * 0.3])
            x_new = np.linspace(x.min(), x.max(), 300)
            spline = make_interp_spline(x, y)
            y_smooth = spline(x_new)

            fig, ax = plt.subplots(figsize=(6, 4))
            ax.plot(x_new, y_smooth, color='green')
            ax.set_title('Yield Growth Over Time')

            for widget in graph_frame.winfo_children():
                widget.destroy()

            canvas = FigureCanvasTkAgg(fig, master=graph_frame)
            canvas.draw()
            canvas.get_tk_widget().pack()

    btn_show = tk.Button(content_frame, text="Show Recommendation", font=("Arial", 14), bg='green', fg='white', command=show_result)
    btn_show.pack(pady=10)

def crop_size_page():
    reset_frame("Crop Size Prediction")

    crop_var = tk.StringVar()
    day_var = tk.StringVar()

    crops = df_crop_size['crop_name'].unique().tolist()
    crop_dropdown = ttk.Combobox(content_frame, textvariable=crop_var, values=crops, font=("Arial", 14), state="readonly")
    crop_dropdown.pack(pady=10)
    crop_dropdown.set('Select Crop')

    day_entry = tk.Entry(content_frame, textvariable=day_var, font=("Arial", 14))
    day_entry.pack(pady=10)
    day_entry.insert(0, "Enter number of days")

    result_label = tk.Label(content_frame, text="", font=("Arial", 16), bg='white')
    result_label.pack(pady=10)

    graph_frame = tk.Frame(content_frame, bg='white')
    graph_frame.pack(pady=20)

    def predict_growth():
        crop = crop_var.get()
        try:
            day = int(day_var.get())
            crop_data = df_crop_size[df_crop_size['crop_name'] == crop]

            if not crop_data.empty:
                predicted_height = np.interp(day, crop_data['day'], crop_data['height_meters'])
                result_label.config(text=f"Predicted Height after {day} days: {predicted_height:.2f} meters")

                fig, ax = plt.subplots(figsize=(6, 4))
                ax.plot(crop_data['day'], crop_data['height_meters'], 'o-', color='blue')
                ax.set_title(f'{crop} Growth Over Time')
                ax.set_xlabel('Days')
                ax.set_ylabel('Height (m)')

                for widget in graph_frame.winfo_children():
                    widget.destroy()

                canvas = FigureCanvasTkAgg(fig, master=graph_frame)
                canvas.draw()
                canvas.get_tk_widget().pack()

        except ValueError:
            messagebox.showerror("Invalid Input", "Please enter a valid number of days.")

    btn_predict = tk.Button(content_frame, text="Predict Growth", font=("Arial", 14), bg='blue', fg='white', command=predict_growth)
    btn_predict.pack(pady=10)

def market_price_page():
    reset_frame("Market Price Estimation")

    crop_var = tk.StringVar()
    month_var = tk.StringVar()

    crops = list(df_market_price['crop_name'].unique())
    months = list(df_market_price['month'].unique())

    crop_dropdown = ttk.Combobox(content_frame, textvariable=crop_var, values=crops, font=("Arial", 14), state="readonly")
    crop_dropdown.pack(pady=10)
    crop_dropdown.set('Select Crop')

    month_dropdown = ttk.Combobox(content_frame, textvariable=month_var, values=months, font=("Arial", 14), state="readonly")
    month_dropdown.pack(pady=10)
    month_dropdown.set('Select Month')

    result_label = tk.Label(content_frame, text="", font=("Arial", 16), bg='white')
    result_label.pack(pady=10)

    graph_frame = tk.Frame(content_frame, bg='white')
    graph_frame.pack(pady=20)

    def show_market_price():
        crop = crop_var.get()
        try:
            month = int(month_var.get())
        except ValueError:
            messagebox.showerror("Invalid Input", "Please select a valid month.")
            return

        row = df_market_price[(df_market_price['crop_name'] == crop) & (df_market_price['month'] == month)]
        if not row.empty:
            price = row.iloc[0]['market_price_per_kg']
            result_label.config(text=f"Market Price: ₹{price} per kg")

            monthly_prices = df_market_price[df_market_price['crop_name'] == crop]
            fig, ax = plt.subplots(figsize=(6, 4))
            ax.plot(monthly_prices['month'], monthly_prices['market_price_per_kg'], marker='o', color='green')
            ax.set_title(f'Monthly Market Price for {crop}')
            ax.set_xlabel('Month')
            ax.set_ylabel('Price (₹)')

            for widget in graph_frame.winfo_children():
                widget.destroy()

            chart = FigureCanvasTkAgg(fig, master=graph_frame)
            chart.draw()
            chart.get_tk_widget().pack()
        else:
            messagebox.showerror("Data Not Found", "No data found for the selected crop and month.")

    submit_button = tk.Button(content_frame, text="Get Market Price", font=("Arial", 14), bg="#3CB371", fg="white", command=show_market_price)
    submit_button.pack(pady=10)

def soil_sustainability_page():
    reset_frame("Soil Sustainability Recommendation")

    soil_color_var = tk.StringVar()
    soil_colors = list(df_soil['soil_color'].unique())

    soil_dropdown = ttk.Combobox(content_frame, textvariable=soil_color_var, values=soil_colors, font=("Arial", 14), state="readonly")
    soil_dropdown.pack(pady=10)
    soil_dropdown.set('Select Soil Color')

    result_label = tk.Label(content_frame, text="", font=("Arial", 16), bg='white')
    result_label.pack(pady=10)

    def show_soil_recommendation():
        soil_color = soil_color_var.get()
        row = df_soil[df_soil['soil_color'] == soil_color]
        if not row.empty:
            best_crop = row.iloc[0]['best_crop']
            rotation = row.iloc[0]['rotations_possible']
            fertilizer = row.iloc[0]['recommended_fertilizer']
            result_label.config(text=f"Best Crop: {best_crop}\nRotation Crops: {rotation}\nRecommended Fertilizer: {fertilizer}")
        else:
            messagebox.showerror("Error", "No data found for selected soil color.")

    submit_button = tk.Button(content_frame, text="Get Recommendation", font=("Arial", 14), bg="#3CB371", fg="white", command=show_soil_recommendation)
    submit_button.pack(pady=10)

def yield_prediction_page():
    reset_frame("Yield Prediction")

    crop_var = tk.StringVar()
    day_var = tk.IntVar()

    crops = list(df_yield['crop_name'].unique())
    crop_dropdown = ttk.Combobox(content_frame, textvariable=crop_var, values=crops, font=("Arial", 14), state="readonly")
    crop_dropdown.pack(pady=10)
    crop_dropdown.set('Select Crop')

    tk.Label(content_frame, text="Enter Day Since Harvest:", font=("Arial", 14), bg='white').pack(pady=5)
    day_entry = tk.Entry(content_frame, textvariable=day_var, font=("Arial", 14))
    day_entry.pack(pady=5)

    result_label = tk.Label(content_frame, text="", font=("Arial", 16), bg='white')
    result_label.pack(pady=10)

    graph_frame = tk.Frame(content_frame, bg='white')
    graph_frame.pack(pady=20)

    def predict_yield():
        crop = crop_var.get()
        day = day_var.get()

        if crop and day:
            row = df_yield[df_yield['crop_name'] == crop]
            if not row.empty:
                harvest_day = row.iloc[0]['harvest_day']
                expected_yield = row.iloc[0]['yield_kg']

                if day > harvest_day:
                    result_label.config(text=f"Crop {crop} is ready for harvest!\nExpected Yield: {expected_yield} kg")
                else:
                    remaining = harvest_day - day
                    result_label.config(text=f"Days Remaining: {remaining} days\nExpected Yield: {expected_yield} kg")

                x = np.linspace(0, harvest_day, 100)
                y = expected_yield * (x / harvest_day) ** 2

                fig, ax = plt.subplots(figsize=(6, 4))
                ax.plot(x, y, color='orange')
                ax.set_title(f'Growth Curve of {crop}')
                ax.set_xlabel('Days')
                ax.set_ylabel('Yield (kg)')

                for widget in graph_frame.winfo_children():
                    widget.destroy()

                chart = FigureCanvasTkAgg(fig, master=graph_frame)
                chart.draw()
                chart.get_tk_widget().pack()
            else:
                messagebox.showerror("Error", "No data found for selected crop.")
        else:
            messagebox.showerror("Error", "Please select crop and enter day.")

    submit_button = tk.Button(content_frame, text="Predict Yield", font=("Arial", 14), bg="#3CB371", fg="white", command=predict_yield)
    submit_button.pack(pady=10)

def leaf_disease_detection_page():
    reset_frame("Leaf Disease Detection")

    result_label = tk.Label(content_frame, text="", font=("Arial", 16), bg='white')
    result_label.pack(pady=20)

    def preprocess_image(img_path):
        img = image.load_img(img_path, target_size=(128, 128))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def predict_image():
        file_path = filedialog.askopenfilename()
        if file_path:
            img_array = preprocess_image(file_path)
            prediction = disease_model.predict(img_array)

            class_labels = ['Apple Scab', 'Apple Black Rot', 'Cedar Apple Rust', 'Healthy',
                            'Tomato Late Blight', 'Tomato Mosaic Virus', 'Tomato Yellow Leaf Curl Virus',
                            'Potato Early Blight', 'Potato Late Blight']

            if prediction.shape[1] > 1:
                predicted_class = np.argmax(prediction, axis=1)[0]
            else:
                predicted_class = int(np.round(prediction[0][0]))

            result = class_labels[predicted_class] if predicted_class < len(class_labels) else "Unknown class"
            result_label.config(text=f"Prediction: {result}")

    btn_predict = tk.Button(content_frame, text="Choose Image & Predict", font=("Arial", 14),
                            bg="#3399ff", fg="white", command=predict_image)
    btn_predict.pack(pady=10)

# -------- Mainloop --------
root.mainloop()
