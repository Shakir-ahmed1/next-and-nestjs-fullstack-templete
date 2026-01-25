export const authDoc = {
  paths: {
    '/api/auth/sign-in/email': {
      post: {
        tags: ['Auth'],
        summary: 'LLLogin with email and password (sets session cookie)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Success - returns user info and sets session cookie',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { type: 'object' }, // optional: link to User schema
                  },
                  required: ['user'],
                },
              },
            },
          },
          400: { description: 'Bad Request' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/sign-up/email': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user with email and password',
        description: `
⚠️ **Important**

This endpoint is intended to be called **only from the browser via the Better Auth client** 
(e.g. \`authClient.signUp.email()\`).

Direct calls from Swagger UI, Postman, or curl are **not supported** and may fail due to:
- CSRF protection enforced by Better Auth
- Origin and cookie requirements
- Internal user ID generation that is handled by the Better Auth client flow

Use this endpoint through the official Better Auth client SDK in the frontend.
`,
        responses: {},
      },
    },

    '/api/auth/sign-out': {
      post: {
        tags: ['Auth'],
        summary: 'Sign out user (clears session cookie)',
        responses: {
          200: {
            description: 'Success - session cookie cleared',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { success: { type: 'boolean', example: true } },
                  required: ['success'],
                },
              },
            },
          },
          400: { description: 'Bad Request' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
