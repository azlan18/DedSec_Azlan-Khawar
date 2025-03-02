from flask import Flask, request, jsonify
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import google.generativeai as genai
import os
import io
import base64
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Function to load the model
def load_model():
    model = models.densenet121(pretrained=True)
    model.classifier = torch.nn.Linear(1024, 14)
    # Note: In a production app, you would load your trained weights here
    # model.load_state_dict(torch.load("model_weights.pth"))
    model.eval()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return model.to(device)

# Preprocess image function
def preprocess_image(image):
    transform = transforms.Compose([
        transforms.Grayscale(num_output_channels=3),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    img = transform(image).unsqueeze(0)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return img.to(device)

# Set up Gemini
def initialize_gemini():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set")
    
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-pro')

# Disease labels
disease_labels = [
    "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration",
    "Mass", "Nodule", "Pneumonia", "Pneumothorax", "Consolidation",
    "Edema", "Emphysema", "Fibrosis", "Pleural_Thickening", "Hernia"
]

# Load model at startup
model = load_model()

@app.route('/analyze', methods=['POST'])
def analyze_xray():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    try:
        # Open and process the image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Model prediction
        input_tensor = preprocess_image(image)
        with torch.no_grad():
            output = model(input_tensor)
        output_probs = torch.sigmoid(output[0])

        # Prepare results
        results = {}
        for label, prob in zip(disease_labels, output_probs.cpu().numpy()):
            results[label] = float(prob)
        
        # Sort by probability
        sorted_results = dict(sorted(results.items(), key=lambda x: x[1], reverse=True))
        
        # Generate AI analysis
        try:
            # Initialize Gemini
            model_gemini = initialize_gemini()
            
            # Construct prompt with findings
            findings_text = "\n".join([f"{label}: {prob:.4f}" for label, prob in sorted_results.items()])
            prompt = f"""
            You are a medical AI assistant helping radiologists analyze chest X-rays.
            
            The image shows a chest X-ray, and our model has detected the following probabilities for various conditions:
            
            {findings_text}
            
            Please provide a detailed analysis in markdown format with the following sections:

            # Summary
            A brief overview of the key findings

            ## Key Findings
            - List the most significant findings
            - Highlight critical values
            - Note any concerning patterns

            ## Clinical Interpretation
            Detailed interpretation of the findings, including:
            - Primary concerns
            - Potential diagnoses
            - Pattern recognition

            ## Recommendations
            1. Immediate actions required (if any)
            2. Follow-up tests or examinations
            3. Monitoring requirements

            ## Differential Diagnoses
            - List potential diagnoses
            - Order by likelihood
            - Include supporting evidence

            Please use markdown formatting including:
            - Headers (# ## ###)
            - Lists (- and 1. 2. 3.)
            - **Bold** for emphasis
            - *Italic* for medical terms
            - > Blockquotes for important notes
            """
            
            # Get response from Gemini
            response = model_gemini.generate_content([prompt, image])
            ai_analysis = response.text
            
        except Exception as e:
            ai_analysis = f"Error generating AI analysis: {str(e)}"
        
        # Convert image to base64 for sending to frontend
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            "predictions": sorted_results,
            "ai_analysis": ai_analysis,
            "image": img_str
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4000)