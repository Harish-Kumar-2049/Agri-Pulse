@echo off
echo 🔧 Setting up AgriPulse ML Service...

REM Create virtual environment
echo 📦 Creating Python virtual environment...
python -m venv ml_env

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call ml_env\Scripts\activate

REM Install requirements
echo 📚 Installing Python packages...
pip install -r requirements.txt

echo ✅ Setup complete!
echo.
echo To run the ML service:
echo 1. Activate the environment: ml_env\Scripts\activate
echo 2. Place your H5 model in the 'models' folder
echo 3. Update the model path and class names in app.py
echo 4. Run: python app.py

pause
