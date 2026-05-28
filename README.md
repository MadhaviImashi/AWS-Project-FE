# CW Events — Frontend

Event management platform built with Next.js, deployed on AWS Amplify.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: AWS Amplify v6 (`aws-amplify/auth`)
- **HTTP Client**: Axios
- **Package Manager**: pnpm

## AWS Resources

| Resource | Purpose |
|----------|---------|
| **AWS Amplify Hosting** | Hosts the Next.js SSR app with CI/CD from GitHub |
| **Amazon Cognito** | User authentication — sign up, sign in, email verification, JWT tokens |
| **API Gateway (HTTP API)** | REST API gateway that routes requests to Lambda functions |
| **AWS Lambda** | Serverless backend handlers (events, registrations, files, email, auth trigger) |
| **Amazon RDS (PostgreSQL)** | Relational database storing users, events, registrations, and file metadata |
| **Amazon S3** | Stores uploaded event files (images, documents) |
| **AWS Secrets Manager** | Manages RDS credentials (auto-rotated) |
| **Amazon SES** | Sends registration confirmation emails to users |

## Project Structure

```
app/
├── (auth)/
│   ├── login/          # Sign in page
│   ├── register/       # Sign up page
│   └── confirm/        # Email verification page
├── (user)/
│   ├── events/         # Event listing and detail pages
│   └── my-registrations/ # User's registered events
├── admin/
│   └── events/         # Admin: create, edit, delete events; manage files
└── page.tsx            # Root redirect (login or events based on auth state)

components/
└── auth/
    └── AuthProvider.tsx  # Cognito auth context (tokens, user state, sign in/out)

lib/
├── amplify.ts          # Amplify configuration
├── auth/
│   └── useAuth.ts      # Auth hook
└── api/
    ├── client.ts       # Axios instance — attaches Cognito ID token to every request
    ├── events.ts       # Event and file CRUD API calls
    └── files.ts        # S3 pre-signed URL helpers

types/
└── index.ts            # Shared TypeScript types
```

## Authentication Flow

1. User signs up → Cognito sends verification email
2. User confirms with code → `auth-postConfirmation` Lambda adds them to the `Users` group and creates a DB record
3. User signs in → Cognito returns ID token, Access token, Refresh token (stored in `localStorage` by Amplify)
4. Every API request → Axios interceptor calls `fetchAuthSession()` which automatically refreshes the ID token if expired (using the 30-day Refresh token)
5. API Gateway JWT authorizer validates the token before forwarding to Lambda

## File Upload Flow

Uploads go directly from the browser to S3 — Lambda is only involved in setup and recording:

1. `POST /api/v1/files/upload-url` → Lambda returns a pre-signed S3 PUT URL
2. Browser PUTs the file directly to S3 (no Lambda, no size limits)
3. `POST /api/v1/events/:id/files` → Lambda records the file metadata in the DB

## Local Development

1. Clone the repo and install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=https://<your-api-gateway-id>.execute-api.ap-southeast-1.amazonaws.com
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
   NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_COGNITO_REGION=ap-southeast-1
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deployment

The app is deployed via **AWS Amplify Hosting** with automatic CI/CD on push to `main`.

Build configuration is defined in [`amplify.yml`](amplify.yml):
- Installs pnpm v9
- Runs `pnpm build`
- Deploys the `.next` output directory

Environment variables are configured in the Amplify Console under the app's environment settings.

## User Roles

| Role | Access |
|------|--------|
| **User** | Browse events, register/cancel registrations, view uploaded files |
| **Admin** | All user access + create/edit/delete events, upload/delete files, view registrations per event |

Roles are managed via Cognito groups (`Users`, `Admins`). The role is read from the `cognito:groups` claim in the ID token.
