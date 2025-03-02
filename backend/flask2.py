from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import cv2
from PIL import Image
import io
import os
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# CT scan class names
class_names = ["aneurysm", "cancer", "tumor"]

# Function to load the CT scan model
def load_ct_model():
    model_path = "best_model.keras"
    if not os.path.exists(model_path):
        print(f"Error: Model file 'best_model.keras' not found at {os.path.abspath(model_path)}")
        return None
    try:
        model = tf.keras.models.load_model(model_path)
        print("Model loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading CT scan model: {e}")
        return None

# Preprocess CT scan image function
def preprocess_ct_image(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = np.array(image)
        img = cv2.resize(img, (224, 224))
        img = img / 255.0
        img = np.expand_dims(img, axis=0)
        return img
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

# Initialize Gemini model
def initialize_gemini():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-pro')

# Load the model at startup
model = load_ct_model()
if model is None:
    print("Failed to load model. Server will run but predictions will fail.")

@app.route('/analyzectscan', methods=['POST'])
def analyze_ctscan():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    try:
        image_bytes = file.read()
        preprocessed_img = preprocess_ct_image(image_bytes)
        
        if preprocessed_img is None:
            return jsonify({"error": "Failed to preprocess image"}), 400
        
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        predictions = model.predict(preprocessed_img)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        prediction_dict = {class_name: float(prob) for class_name, prob in zip(class_names, predictions[0])}
        
        try:
            # Initialize Gemini for analysis
            model_gemini = initialize_gemini()
            
            findings_text = "\n".join([f"{class_name}: {prob:.4f}" for class_name, prob in prediction_dict.items()])
            prompt = f"""
            You are a medical AI assistant analyzing a CT scan.

            The model has detected the following probabilities for conditions:

            {findings_text}

            Please provide a detailed analysis in markdown format with the following sections:

            # Summary
            A brief overview of the key findings

            ## Key Findings
            - List the most significant findings
            - Highlight critical values

            ## Clinical Interpretation
            - Primary concerns
            - Potential diagnoses
            - Pattern recognition

            ## Recommendations
            - Immediate actions required
            - Follow-up tests

            ## Differential Diagnoses
            - List potential diagnoses ordered by likelihood
            
            Please use markdown formatting.
            """
            response = model_gemini.generate_content([prompt])
            ai_analysis = response.text
        except Exception as e:
            ai_analysis = f"Error generating AI analysis: {str(e)}"
        
        response = {
            "predictions": prediction_dict,
            "predicted_class": class_names[predicted_class_idx],
            "confidence": confidence,
            "ai_analysis": ai_analysis
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "model_loaded": model is not None})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=4001, debug=True)
