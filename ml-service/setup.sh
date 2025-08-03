#!/bin/bash

echo "🔧 Setting up AgriPulse ML Service..."

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python -m venv ml_env

# Activate virtual environment (Windows)
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source ml_env/Scripts/activate
else
    source ml_env/bin/activate
fi

# Install requirements
echo "📚 Installing Python packages..."
pip install -r requirements.txt

echo "✅ Setup complete!"
echo ""
echo "To run the ML service:"
echo "1. Activate the environment:"
echo "   - Windows: ml_env\\Scripts\\activate"
echo "   - Linux/Mac: source ml_env/bin/activate"
echo "2. Place your H5 model in the 'models' folder"
echo "3. Update the model path and class names in app.py"
echo "4. Run: python app.py"
