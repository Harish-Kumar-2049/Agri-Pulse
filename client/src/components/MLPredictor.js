import * as tf from '@tensorflow/tfjs';
import { useState, useEffect } from 'react';

const MLPredictor = ({ user }) => {
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Load model on component mount
  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      // You'll need to convert your H5 model to TensorFlow.js format first
      const loadedModel = await tf.loadLayersModel('/models/model.json');
      setModel(loadedModel);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => predictCrop(img);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const predictCrop = async (imageElement) => {
    if (!model) {
      alert('Model not loaded yet');
      return;
    }

    setLoading(true);
    try {
      // Preprocess image
      const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224]) // Adjust size based on your model
        .toFloat()
        .div(tf.scalar(255))
        .expandDims();

      // Make prediction
      const predictions = await model.predict(tensor).data();
      
      // Process results
      const classes = ['Healthy Crop', 'Disease Detected', 'Pest Damage', 'Nutrient Deficiency'];
      const maxIndex = predictions.indexOf(Math.max(...predictions));
      
      setPrediction({
        class: classes[maxIndex],
        confidence: (predictions[maxIndex] * 100).toFixed(2),
        allPredictions: predictions
      });

      // Clean up
      tensor.dispose();
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Prediction failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '2rem', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      margin: '2rem 0'
    }}>
      <h3 style={{ color: '#333', marginBottom: '1rem' }}>
        🔬 AI Crop Analysis
      </h3>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Upload a photo of your crop to get AI-powered health analysis
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          border: '2px solid #e0e0e0',
          borderRadius: '6px',
          width: '100%'
        }}
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p>Analyzing your crop...</p>
        </div>
      )}

      {prediction && !loading && (
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          <h4 style={{ color: '#333', marginBottom: '1rem' }}>Analysis Results:</h4>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Prediction:</strong> {prediction.class}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Confidence:</strong> {prediction.confidence}%
          </div>
          
          {prediction.class !== 'Healthy Crop' && (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              padding: '1rem',
              borderRadius: '6px',
              marginTop: '1rem'
            }}>
              <h5 style={{ color: '#856404', margin: '0 0 0.5rem 0' }}>
                📋 Recommendations:
              </h5>
              <ul style={{ color: '#856404', margin: 0, paddingLeft: '1.5rem' }}>
                <li>Consult with local agricultural experts</li>
                <li>Consider organic treatment options</li>
                <li>Monitor crop regularly for changes</li>
                <li>Ensure proper irrigation and nutrition</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MLPredictor;
