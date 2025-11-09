# MyAiPlug API Documentation

## Overview
This document provides a complete reference for the MyAiPlug Phase 4 API endpoints.

**Base URL**: `/api`  
**Authentication**: Bearer token in `Authorization` header  
**Format**: JSON

---

## Authentication

### POST /api/auth/signup
Create a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "handle": "username"
}
```

**Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "handle": "username",
    "tier": "free"
  },
  "profile": {
    "level": 1,
    "pointsTotal": 150,
    "timeSavedSecTotal": 0,
    "badges": []
  },
  "sessionToken": "session_1234567890_xyz789",
  "message": "Account created successfully! You earned 150 points and 100 credits."
}
```

**Errors**:
- `400`: Missing required fields, invalid format
- `409`: Email or handle already exists
- `429`: Too many signup attempts

---

### POST /api/auth/signin
Authenticate a user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "user": { /* user object */ },
  "profile": { /* profile object */ },
  "sessionToken": "session_token_here"
}
```

**Errors**:
- `401`: Invalid credentials
- `429`: Too many signin attempts

---

### GET /api/auth/session
Verify session validity and get current user.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "user": { /* user object */ },
  "profile": { /* profile object */ }
}
```

**Errors**:
- `401`: Invalid or expired session

---

### POST /api/auth/logout
Invalidate session token.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Profile

### GET /api/user/profile
Get current user's profile.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "handle": "username",
    "avatarUrl": "https://...",
    "bio": "User bio",
    "tier": "pro"
  },
  "profile": {
    "level": 4,
    "pointsTotal": 18750,
    "timeSavedSecTotal": 54000,
    "badges": [ /* badge objects */ ],
    "privacyOptOut": false
  }
}
```

---

### PUT /api/user/profile
Update user profile.

**Headers**: `Authorization: Bearer <token>`

**Request Body** (all fields optional):
```json
{
  "handle": "newhandle",
  "bio": "Updated bio",
  "avatarUrl": "https://...",
  "privacyOptOut": true
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user */ },
  "profile": { /* updated profile */ }
}
```

**Errors**:
- `409`: Handle already taken
- `429`: Too many update requests

---

### GET /api/user/stats
Get comprehensive user statistics.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "stats": {
    "points": {
      "total": 18750,
      "level": 4
    },
    "jobs": {
      "totalJobs": 25,
      "completedJobs": 24,
      "failedJobs": 1,
      "totalTimeSaved": 54000,
      "totalCreditsUsed": 500
    },
    "creations": {
      "totalCreations": 10,
      "publicCreations": 7,
      "totalViews": 523,
      "totalDownloads": 89,
      "popularCreations": [ /* top 5 */ ]
    },
    "referrals": {
      "totalReferrals": 5,
      "signedUpCount": 4,
      "paidCount": 2,
      "pointsEarned": 1400,
      "creditsEarned": 100,
      "milestones": [ /* milestone progress */ ]
    },
    "badges": {
      "earned": 3,
      "progress": [ /* badge progress array */ ]
    }
  }
}
```

---

## Jobs

### GET /api/jobs
List user's jobs.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `limit` (optional): Number of jobs to return

**Response** (200):
```json
{
  "success": true,
  "jobs": [
    {
      "id": "job_123",
      "userId": "user_123",
      "type": "audio_basic",
      "inputDurationSec": 180,
      "creditsCharged": 15,
      "cpuSec": 45,
      "status": "done",
      "resultUrl": "https://...",
      "qcReport": { /* QC data */ },
      "timeSavedSec": 300,
      "createdAt": "2025-11-09T..."
    }
  ],
  "total": 25
}
```

---

### POST /api/jobs
Create a new job.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "type": "audio_basic",
  "inputDurationSec": 180,
  "inputUrl": "https://..." // optional
}
```

**Response** (200):
```json
{
  "success": true,
  "job": { /* job object */ },
  "message": "Job created and queued for processing"
}
```

**Errors**:
- `400`: Missing required fields
- `429`: Too many job creation requests

---

## Creations/Portfolio

### GET /api/creations
List creations with flexible filtering.

**Query Parameters**:
- `userId`: Get specific user's public creations
- `public=true`: Get all public creations
- `limit`: Limit results
- No params + auth: Get own creations

**Response** (200):
```json
{
  "success": true,
  "creations": [
    {
      "id": "creation_123",
      "userId": "user_123",
      "jobId": "job_123",
      "title": "My Track",
      "tags": ["electronic", "ambient"],
      "mediaUrl": "https://...",
      "thumbnailUrl": "https://...",
      "public": true,
      "views": 142,
      "downloads": 23,
      "createdAt": "2025-11-09T..."
    }
  ]
}
```

---

### POST /api/creations
Add creation to portfolio.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "jobId": "job_123",
  "title": "My Creation",
  "tags": ["tag1", "tag2"],
  "mediaUrl": "https://...",
  "thumbnailUrl": "https://...", // optional
  "isPublic": true
}
```

**Response** (200):
```json
{
  "success": true,
  "creation": { /* creation object */ },
  "pointsAwarded": 50,
  "message": "Creation added to portfolio"
}
```

---

### PUT /api/creations
Update creation details.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "creationId": "creation_123",
  "title": "Updated Title",
  "tags": ["new", "tags"],
  "public": true
}
```

**Response** (200):
```json
{
  "success": true,
  "creation": { /* updated creation */ },
  "message": "Creation updated"
}
```

---

### DELETE /api/creations
Delete a creation.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `id`: Creation ID to delete

**Response** (200):
```json
{
  "success": true,
  "message": "Creation deleted"
}
```

---

## Referrals

### GET /api/referrals
Get referral link, stats, and history.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "referralLink": {
    "code": "username_abc123",
    "url": "https://myaiplug.com?ref=username_abc123"
  },
  "stats": {
    "totalReferrals": 5,
    "signedUpCount": 4,
    "paidCount": 2,
    "pointsEarned": 1400,
    "creditsEarned": 100,
    "milestones": [
      {
        "count": 3,
        "reward": "Pro week pass",
        "unlocked": false,
        "progress": 66
      }
    ]
  },
  "history": [ /* recent 20 referrals */ ]
}
```

---

## Leaderboard

### GET /api/leaderboard
Get leaderboard rankings.

**Query Parameters**:
- `type`: `time_saved`, `referrals`, or `popularity` (default: `time_saved`)
- `period`: `weekly` or `alltime` (default: `alltime`)
- `limit`: Number of entries (default: 100)
- `userId`: Optional, get specific user's rank

**Response** (200):
```json
{
  "success": true,
  "type": "time_saved",
  "period": "alltime",
  "entries": [
    {
      "rank": 1,
      "userId": "user_123",
      "handle": "topuser",
      "avatarUrl": "https://...",
      "value": 360000,
      "level": 7
    }
  ],
  "userRank": 42, // if userId provided
  "lastUpdated": "2025-11-09T..."
}
```

**Errors**:
- `400`: Invalid type or period
- `429`: Too many requests

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Signup | 5 per hour per IP |
| Signin | 10 per 10 minutes per IP |
| Job Create | 50 per hour per user |
| Profile Update | 10 per hour per user |
| Creation Publish | 20 per hour per user |
| Leaderboard | 100 per 10 minutes per IP |
| Profile View | 200 per 10 minutes per IP |

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

### Status Codes
- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

---

## Testing

Use the included test script:
```bash
npm run dev
# In another terminal:
node test-api.js
```

Or test with curl:
```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","handle":"testuser"}'

# Sign in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace TOKEN)
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## Notes

- All services use in-memory storage (Maps) for Phase 4
- Session tokens expire after 30 days
- Points are awarded automatically for actions
- Badges are evaluated on job completion and creation publish
- Leaderboards are cached for 5 minutes
- Users can opt out of leaderboards via privacy settings

For full implementation details, see `PHASE_4_SUMMARY.md`.
