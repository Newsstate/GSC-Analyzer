from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import google.auth.transport.requests
import httpx, os, json, base64

router = APIRouter()

SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid"
]

def get_flow():
    client_config = {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/callback")],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token"
        }
    }
    flow = Flow.from_client_config(client_config, scopes=SCOPES)
    flow.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/callback")
    return flow

@router.get("/google")
def google_auth():
    """Initiate Google OAuth flow."""
    flow = get_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        # Disable PKCE — required when state is not persisted server-side
        code_challenge_method=None
    )
    return {"auth_url": auth_url}

@router.get("/callback")
async def google_callback(code: str = Query(...), state: str = Query(None)):
    """Handle Google OAuth callback."""
    try:
        flow = get_flow()

        # Fetch token without code_verifier (no PKCE)
        flow.fetch_token(
            code=code,
            # Explicitly pass no code_verifier to avoid PKCE mismatch
        )
        creds = flow.credentials

        # Get user info
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {creds.token}"}
            )
            user = r.json()

        token_data = {
            "access_token": creds.token,
            "refresh_token": creds.refresh_token,
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "email": user.get("email", ""),
            "name": user.get("name", ""),
            "picture": user.get("picture", "")
        }

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        encoded = base64.b64encode(json.dumps(token_data).encode()).decode()
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={encoded}")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class TokenRefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh")
async def refresh_token(req: TokenRefreshRequest):
    """Refresh an expired access token."""
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                    "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                    "refresh_token": req.refresh_token,
                    "grant_type": "refresh_token"
                }
            )
            data = r.json()
            if "error" in data:
                raise HTTPException(status_code=401, detail=data["error"])
            return {"access_token": data["access_token"]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/demo")
async def demo_login():
    """Return demo token that uses mock data."""
    return {
        "token": "demo",
        "email": "demo@example.com",
        "name": "Demo User",
        "picture": ""
    }
