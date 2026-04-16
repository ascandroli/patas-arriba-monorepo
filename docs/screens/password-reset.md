# Password Reset — `/password-reset/:token`

## Purpose

Set a new password using a temporary token from the recovery email.

## Elements

- Password field with validation (same rules as signup)
- Submit button

## Behavior

- Token is a JWT with 15-minute expiry
- On success: password updated
- Invalid/expired token: error

## Access

- Anonymous only (token required in URL)