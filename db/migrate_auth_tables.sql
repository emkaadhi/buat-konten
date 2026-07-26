-- =============================================
-- Migration: Tambah tabel auth untuk NextAuth.js
-- Jalankan SQL ini di Neon Dashboard → SQL Editor
-- =============================================

-- 1. Update tabel users — tambah kolom auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "image" text;
ALTER TABLE users ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE users ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email);

-- 2. Tabel account (NextAuth)
CREATE TABLE IF NOT EXISTS "account" (
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "providerAccountId" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  CONSTRAINT account_provider_providerAccountId_pk PRIMARY KEY (provider, providerAccountId)
);

-- 3. Tabel session (NextAuth)
CREATE TABLE IF NOT EXISTS "session" (
  "sessionToken" text PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "expires" timestamp NOT NULL
);

-- 4. Tabel verificationToken (NextAuth)
CREATE TABLE IF NOT EXISTS "verificationToken" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp NOT NULL,
  CONSTRAINT verificationToken_identifier_token_pk PRIMARY KEY (identifier, token)
);

-- 5. Tabel authenticator (NextAuth - WebAuthn)
CREATE TABLE IF NOT EXISTS "authenticator" (
  "credentialID" text NOT NULL UNIQUE,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "providerAccountId" text NOT NULL,
  "credentialPublicKey" text NOT NULL,
  "counter" integer NOT NULL,
  "credentialDeviceType" text NOT NULL,
  "credentialBackedUp" boolean NOT NULL,
  "transports" text,
  CONSTRAINT authenticator_userId_credentialID_pk PRIMARY KEY ("userId", "credentialID")
);