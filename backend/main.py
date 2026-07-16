"""FastAPI application entry point."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_connection
from seed import run_seed
from routers import health, sources, regulations, dashboard, search

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("ri")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Initialising database...")
    init_db()
    run_seed()
    conn = get_connection()
    src_count = conn.execute("SELECT COUNT(*) FROM sources").fetchone()[0]
    reg_count = conn.execute("SELECT COUNT(*) FROM regulations").fetchone()[0]
    field_count = conn.execute("SELECT COUNT(*) FROM regulation_fields").fetchone()[0]
    tamarind = conn.execute("SELECT COUNT(*) FROM sources WHERE origin = 'tamarind'").fetchone()[0]
    conn.close()
    log.info(f"Database ready: {src_count} sources ({tamarind} imported), {reg_count} regulations, {field_count} fields")
    yield
    log.info("Shutting down.")


app = FastAPI(title="Regulatory Intelligence API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(sources.router)
app.include_router(regulations.router)
app.include_router(dashboard.router)
app.include_router(search.router)


@app.middleware("http")
async def log_errors(request: Request, call_next):
    try:
        response = await call_next(request)
        if response.status_code >= 400:
            log.warning(f"{request.method} {request.url.path} -> {response.status_code}")
        return response
    except Exception as exc:
        log.error(f"{request.method} {request.url.path} -> ERROR: {exc}")
        raise


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
