from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import httpx, os, json, base64, secrets

router = APIRouter()

SCOPES = " ".join([
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid"
])

@router.get("/google")
def google_auth():
    """Initiate Google OAuth flow — no PKCE, plain server-side flow."""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/callback")
    state = secrets.token_urlsafe(16)

    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope={SCOPES.replace(' ', '%20')}"
        f"&access_type=offline"
        f"&prompt=consent"
        f"&state={state}"
    )
    return {"auth_url": auth_url}

@router.get("/callback")
async def google_callback(code: str = Query(...), state: str = Query(None)):
    """Handle Google OAuth callback — exchange code for token directly."""
    try:
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/callback")

        async with httpx.AsyncClient() as client:
            # Exchange code for tokens
            token_resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                    "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code"
                }
            )
            tokens = token_resp.json()
            if "error" in tokens:
                raise HTTPException(status_code=400, detail=tokens.get("error_description", tokens["error"]))

            # Get user info
            user_resp = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {tokens['access_token']}"}
            )
            user = user_resp.json()

        token_data = {
            "access_token": tokens["access_token"],
            "refresh_token": tokens.get("refresh_token"),
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "email": user.get("email", ""),
            "name": user.get("name", ""),
            "picture": user.get("picture", "")
        }

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        encoded = base64.b64encode(json.dumps(token_data).encode()).decode()
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={encoded}")

    except HTTPException:
        raise
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
