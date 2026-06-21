from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from main import SimpleMineScheduler

app = FastAPI(title="BRAID Mine Scheduler API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "engine": "SimpleMineScheduler"}


@app.post("/api/solve")
async def solve(
    pcpsp: UploadFile = File(...),
    prec: UploadFile = File(...),
):
    if not pcpsp.filename or not prec.filename:
        raise HTTPException(status_code=400, detail="Both pcpsp and prec files are required")

    try:
        pcpsp_text = (await pcpsp.read()).decode("utf-8")
        prec_text = (await prec.read()).decode("utf-8")
    except UnicodeDecodeError as e:
        raise HTTPException(status_code=400, detail=f"File must be UTF-8 text: {e}") from e

    try:
        scheduler = SimpleMineScheduler()
        scheduler.load_pcpsp_text(pcpsp_text)
        scheduler.load_prec_text(prec_text)
        scheduler.solve()
        result = scheduler.build_result()
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    result["fileNames"] = {
        "pcpsp": pcpsp.filename,
        "prec": prec.filename,
    }
    result["engine"] = "SimpleMineScheduler (Python backend/main.py)"
    return result
