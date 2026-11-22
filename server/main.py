
import asyncio
import json
import os
import time
from collections import deque
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from TikTokLive import TikTokLiveClient
from TikTokLive.events import (
    CommentEvent,
    GiftEvent,
    ConnectEvent,
    DisconnectEvent,
)

USERNAME = os.getenv("TIKTOK_UNIQUE_ID", "").strip().lstrip("@")

events = deque(maxlen=500)
client = None
connected = False
last_error = None
event_id = 0


def publish(payload):
    global event_id
    event_id += 1
    payload.update({"id": event_id, "ts": time.time()})
    events.append(payload)


async def start_tiktok():
    global client, connected, last_error

    if not USERNAME:
        last_error = "TIKTOK_UNIQUE_ID ayarlanmamış"
        return

    try:
        client = TikTokLiveClient(unique_id="@" + USERNAME)

        @client.on(ConnectEvent)
        async def on_connect(event):
            global connected
            connected = True
            last_error = None
            publish({"type": "status", "connected": True})

        @client.on(DisconnectEvent)
        async def on_disconnect(event):
            global connected
            connected = False
            publish({"type": "status", "connected": False})

        @client.on(CommentEvent)
        async def on_comment(event):
            user = event.user.nickname or event.user.unique_id
            publish({
                "type": "comment",
                "user": user,
                "unique_id": event.user.unique_id,
                "comment": event.comment
            })

        @client.on(GiftEvent)
        async def on_gift(event):
            if getattr(event, "streaking", False):
                return

            user = event.user.nickname or event.user.unique_id
            publish({
                "type": "gift",
                "user": user,
                "unique_id": event.user.unique_id,
                "gift": event.gift.name,
                "count": event.repeat_count
            })

        await client.start()

    except Exception as exc:
        connected = False
        last_error = str(exc)
        publish({"type": "error", "message": last_error})


@asynccontextmanager
async def lifespan(app):
    task = asyncio.create_task(start_tiktok()) if USERNAME else None
    yield

    if client and client.connected:
        await client.disconnect()

    if task:
        task.cancel()


app = FastAPI(title="Bihter LIVE Bridge", lifespan=lifespan)

origins = os.getenv("FRONTEND_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
async def home():
    return {
        "service": "Bihter LIVE Bridge",
        "status": "online",
        "tiktok_connected": connected
    }


@app.get("/health")
async def health():
    return {"ok": True}


@app.get("/api/status")
async def status():
    return {
        "ok": True,
        "username": USERNAME,
        "connected": connected,
        "error": last_error
    }


@app.get("/api/stream")
async def stream(request: Request):
    async def generate():
        cursor = 0
        yield "retry: 3000\n\n"

        while not await request.is_disconnected():
            pending = [e for e in events if e["id"] > cursor]

            for item in pending:
                cursor = item["id"]
                yield "data: " + json.dumps(
                    item, ensure_ascii=False
                ) + "\n\n"

            await asyncio.sleep(0.35)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )
