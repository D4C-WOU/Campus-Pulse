from fastapi import FastAPI

app = FastAPI(
  title = 'Campus Pulse API',
  version='2.0'
)

@app.get('/')
def root():
  return{
    'message':'Campus is Running'
  }

@app.get('/health')
def health():
  return{
    'status':"healthy"
  }