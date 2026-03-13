# CORRECTED DOMAIN_PERFORMANCE WORKER CODE BLOCK

# 1. Load environment variables (already added)
from dotenv import load_dotenv
load_dotenv()

# 2. Extract and validate PSI_API_KEY (already updated)
api_key = os.getenv('PSI_API_KEY')
if not api_key or api_key == 'your_actual_api_key_here':
    raise ValueError("PSI_API_KEY not found in environment variables or still set to placeholder value")

# 3. Debug log to verify API key is loaded (already added)
print(f"[DOMAIN_PERFORMANCE] Using PSI API key: {api_key[:6]}***")

# 4. PageSpeed request params (already correct)
mobile_params = {
    'url': main_url,
    'strategy': 'mobile',
    'key': api_key,  # Now uses environment variable, not hardcoded
    'category': 'performance'
}

desktop_params = {
    'url': main_url,
    'strategy': 'desktop', 
    'key': api_key,  # Now uses environment variable, not hardcoded
    'category': 'performance'
}

# NEXT STEPS TO COMPLETE THE FIX:
# 1. Replace the placeholder in .env file with your real API key
# 2. Restart the Python worker
# 3. Test the worker
