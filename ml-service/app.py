from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64
import os

app = Flask(__name__)
CORS(app)

# Global variables
model = None
class_names = []  # Will be updated based on your model

def load_model():
    """Load the disease detection H5 model"""
    global model, class_names
    try:
        # Path to the disease detection model
        model_path = 'diseaseModel.h5'
        
        if os.path.exists(model_path):
            model = tf.keras.models.load_model(model_path)
            print("✅ Disease detection model loaded successfully!")
            print(f"Input shape: {model.input_shape}")
            print(f"Output shape: {model.output_shape}")
            
            # Common plant disease classes - update based on your actual model
            class_names = [
                'Healthy',
                'Bacterial_Blight', 
                'Brown_Spot',
                'Leaf_Smut',
                'Early_Blight',
                'Late_Blight',
                'Powdery_Mildew',
                'Rust',
                'Mosaic_Virus',
                'Yellowing'
            ]
            
        else:
            print(f"❌ Model file not found at: {model_path}")
            print("Please ensure diseaseModel.h5 is in the ml-service directory")
            
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")

def preprocess_image(image, target_size=(224, 224)):
    """
    Preprocess image for your model
    Update this function based on your model's requirements
    """
    # Resize image
    image = image.resize(target_size)
    
    # Convert to RGB if not already
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Convert to numpy array
    image_array = np.array(image)
    
    # Normalize pixel values (update based on your model's training)
    # Common options:
    # Option 1: Scale to 0-1
    image_array = image_array.astype(np.float32) / 255.0
    
    # Option 2: ImageNet normalization (uncomment if needed)
    # mean = np.array([0.485, 0.456, 0.406])
    # std = np.array([0.229, 0.224, 0.225])
    # image_array = (image_array - mean) / std
    
    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)
    
    return image_array

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model is not None else "not loaded"
    return jsonify({
        'status': 'ML service is running',
        'model_status': model_status,
        'classes': class_names
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        # Get image data from request
        data = request.json
        if 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        image_data = data['image']
        
        # Handle base64 encoded images
        if image_data.startswith('data:image'):
            # Remove data URL prefix
            image_data = image_data.split(',')[1]
        
        # Decode base64 image
        try:
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            return jsonify({'error': f'Invalid image data: {str(e)}'}), 400
        
        # Preprocess image
        processed_image = preprocess_image(image)
        
        # Make prediction
        predictions = model.predict(processed_image)
        predictions = predictions[0]  # Remove batch dimension
        
        # Get predicted class
        predicted_class_index = np.argmax(predictions)
        predicted_class = class_names[predicted_class_index] if predicted_class_index < len(class_names) else f"Class_{predicted_class_index}"
        confidence = float(predictions[predicted_class_index])
        
        # Prepare response
        response = {
            'success': True,
            'prediction': predicted_class,
            'confidence': round(confidence * 100, 2),  # Convert to percentage
            'all_predictions': {
                class_names[i] if i < len(class_names) else f"Class_{i}": round(float(pred) * 100, 2)
                for i, pred in enumerate(predictions)
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'input_shape': model.input_shape,
        'output_shape': model.output_shape,
        'classes': class_names,
        'num_classes': len(class_names)
    })

if __name__ == '__main__':
    print("🚀 Starting AgriPulse ML Service...")
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Load the model
    load_model()
    
    # Start the Flask app
    app.run(debug=True, host='0.0.0.0', port=5001)
