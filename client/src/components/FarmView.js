import React, { useState, useRef } from 'react';

const FarmView = ({ user, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState(null);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setAnalysisResult(null);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      setStream(mediaStream);
      setIsCapturing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setAnalysisResult(null);
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  // Analyze image using ML service
  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Convert image to base64
      const base64Image = await fileToBase64(selectedImage);
      
      // Send to backend
      const response = await fetch('http://localhost:5000/predict-disease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAnalysisResult(data);
      } else {
        throw new Error(data.message || 'Analysis failed');
      }

    } catch (err) {
      console.error('Analysis error:', err);
      let errorMessage = 'Analysis failed';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend server is running.';
      } else if (err.message.includes('ML service is not available')) {
        errorMessage = 'ML service is not running. Please start the ML service on port 5001.';
      } else if (err.message.includes('Unexpected token')) {
        errorMessage = 'Server error. The ML service may not be running properly.';
      } else {
        errorMessage = `Analysis failed: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get health status color
  const getHealthColor = (prediction) => {
    if (prediction.toLowerCase().includes('healthy')) {
      return '#4CAF50';
    } else if (prediction.toLowerCase().includes('disease') || 
               prediction.toLowerCase().includes('blight') ||
               prediction.toLowerCase().includes('spot') ||
               prediction.toLowerCase().includes('rust')) {
      return '#f44336';
    } else {
      return '#ff9800';
    }
  };

  // Get recommendations based on prediction
  const getRecommendations = (prediction) => {
    const pred = prediction.toLowerCase();
    
    if (pred.includes('healthy')) {
      return [
        'Continue current care routine',
        'Monitor regularly for any changes',
        'Ensure proper watering and fertilization',
        'Maintain good air circulation'
      ];
    } else if (pred.includes('bacterial_blight')) {
      return [
        'Remove affected leaves immediately',
        'Apply copper-based fungicide',
        'Improve air circulation',
        'Avoid overhead watering'
      ];
    } else if (pred.includes('brown_spot')) {
      return [
        'Remove infected plant debris',
        'Apply fungicide treatment',
        'Ensure proper drainage',
        'Space plants adequately'
      ];
    } else if (pred.includes('blight')) {
      return [
        'Remove and destroy infected plant parts',
        'Apply preventive fungicide',
        'Improve soil drainage',
        'Rotate crops next season'
      ];
    } else if (pred.includes('rust')) {
      return [
        'Remove affected leaves',
        'Apply rust-specific fungicide',
        'Increase air circulation',
        'Avoid watering leaves directly'
      ];
    } else {
      return [
        'Consult with agricultural extension officer',
        'Consider professional plant diagnosis',
        'Monitor plant closely',
        'Apply general plant care practices'
      ];
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          borderRadius: '16px 16px 0 0',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#4CAF50', fontSize: '1.8rem' }}>
              🌱 Farm Health Analyzer
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Upload or capture an image to analyze crop health
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '2rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.25rem',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Camera capture section */}
          {isCapturing && (
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  borderRadius: '12px',
                  marginBottom: '1rem'
                }}
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={capturePhoto}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  📷 Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Image upload/capture options */}
          {!isCapturing && !previewUrl && (
            <div style={{
              border: '2px dashed #ddd',
              borderRadius: '12px',
              padding: '3rem 2rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Choose Image Source</h3>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  📁 Upload Image
                </button>
                
                <button
                  onClick={startCamera}
                  style={{
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  📷 Use Camera
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Image preview */}
          {previewUrl && !isCapturing && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h4 style={{ margin: 0, color: '#333' }}>Selected Image</h4>
                <button
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedImage(null);
                    setAnalysisResult(null);
                    setError('');
                  }}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Remove
                </button>
              </div>
              
              <img
                src={previewUrl}
                alt="Selected crop"
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: 'auto',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
              
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  style={{
                    background: isAnalyzing ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    margin: '0 auto'
                  }}
                >
                  {isAnalyzing ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Analyzing...
                    </>
                  ) : (
                    <>🔍 Analyze Crop Health</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid #ffcdd2'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Analysis results */}
          {analysisResult && (
            <div style={{
              background: '#f8f9fa',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔬 Analysis Results
              </h3>
              
              {/* Main result */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: `3px solid ${getHealthColor(analysisResult.prediction)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ 
                      margin: '0 0 0.5rem 0',
                      color: getHealthColor(analysisResult.prediction),
                      fontSize: '1.3rem'
                    }}>
                      {analysisResult.prediction.replace(/_/g, ' ')}
                    </h4>
                    <p style={{ margin: 0, color: '#666' }}>
                      Confidence: {analysisResult.confidence}%
                    </p>
                  </div>
                  <div style={{
                    fontSize: '2.5rem',
                    opacity: 0.7
                  }}>
                    {analysisResult.prediction.toLowerCase().includes('healthy') ? '✅' : '⚠️'}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h5 style={{ margin: '0 0 1rem 0', color: '#333' }}>📋 Recommendations:</h5>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {getRecommendations(analysisResult.prediction).map((rec, index) => (
                    <li key={index} style={{ 
                      color: '#555',
                      marginBottom: '0.5rem',
                      lineHeight: '1.5'
                    }}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* All predictions */}
              {analysisResult.all_predictions && (
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px'
                }}>
                  <h5 style={{ margin: '0 0 1rem 0', color: '#333' }}>📊 Detailed Analysis:</h5>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {Object.entries(analysisResult.all_predictions)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([condition, confidence]) => (
                      <div key={condition} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        background: '#f8f9fa',
                        borderRadius: '4px'
                      }}>
                        <span style={{ color: '#555' }}>
                          {condition.replace(/_/g, ' ')}
                        </span>
                        <span style={{ 
                          fontWeight: '600',
                          color: confidence > 50 ? '#4CAF50' : '#666'
                        }}>
                          {confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add spinning animation CSS */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default FarmView;
