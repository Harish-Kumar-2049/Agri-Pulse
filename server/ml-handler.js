const tf = require('@tensorflow/tfjs-node');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

// Load model (you'll need to convert H5 to TensorFlow.js format first)
let model;

async function loadModel() {
  try {
    // Convert your H5 model to TensorFlow.js format first using:
    // tensorflowjs_converter --input_format=keras path/to/model.h5 path/to/tfjs_model
    model = await tf.loadLayersModel('file://./models/model.json');
    console.log('ML Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
  }
}

// Call this when your server starts
loadModel();

// ML prediction endpoint
app.post('/predict-crop', upload.single('image'), async (req, res) => {
  try {
    if (!model) {
      return res.status(500).json({ error: 'Model not loaded' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Preprocess image
    const imageBuffer = await sharp(req.file.buffer)
      .resize(224, 224) // Adjust based on your model
      .raw()
      .toBuffer();

    // Convert to tensor
    const tensor = tf.tensor3d(new Uint8Array(imageBuffer), [224, 224, 3])
      .div(255.0)
      .expandDims(0);

    // Make prediction
    const prediction = await model.predict(tensor).data();
    
    // Process results
    const classes = ['Healthy', 'Disease_A', 'Disease_B', 'Pest_Damage'];
    const maxIndex = prediction.indexOf(Math.max(...prediction));
    
    res.json({
      prediction: classes[maxIndex],
      confidence: prediction[maxIndex],
      allPredictions: Array.from(prediction)
    });

    // Clean up tensor
    tensor.dispose();

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

module.exports = { loadModel };
