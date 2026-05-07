require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Clerk } = require('@clerk/clerk-sdk-node');
const { requireAuth } = require('@clerk/express');

const app = express();
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files from the project root
app.use(express.static(__dirname));

// ========== PUBLIC ENDPOINTS ==========

// Get publishable key for frontend
app.get('/api/config', (req, res) => {
  res.json({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY
  });
});

// Email/password signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await clerk.users.create({
      emailAddress: [email],
      password,
      firstName,
      lastName,
    });

    const session = await clerk.sessions.create({ userId: user.id });
    const sessionToken = await clerk.sessions.getSessionToken(session.id);

    res.json({
      user: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      sessionToken,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Email/password signin
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const users = await clerk.users.getUserList({
      emailAddress: [email],
      limit: 1
    });

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    try {
      await clerk.authentications.verifyPassword({
        userId: user.id,
        password,
      });
    } catch (verifyError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const session = await clerk.sessions.create({ userId: user.id });
    const sessionToken = await clerk.sessions.getSessionToken(session.id);

    res.json({
      user: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      sessionToken,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// OAuth redirect - redirects to Clerk's OAuth page
app.get('/api/auth/oauth/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    // Map provider names to Clerk provider identifiers
    const providerMap = {
      'google': 'google',
      'facebook': 'facebook',
      'github': 'github',
    };

    const clerkProvider = providerMap[provider.toLowerCase()];
    
    if (!clerkProvider) {
      return res.status(400).json({ 
        error: `Invalid provider: ${provider}. Supported: google, facebook, github` 
      });
    }

    const redirectUrl = await clerk.auth.createOauthRedirectUrl({
      provider: clerkProvider,
      redirectUrl: `${frontendUrl}/auth/callback.html`,
    });

    console.log(`OAuth redirect for ${clerkProvider} → ${redirectUrl.url}`);
    res.redirect(redirectUrl.url);
  } catch (error) {
    console.error('OAuth redirect error:', error);
    res.status(500).json({ 
      error: 'OAuth failed', 
      details: error.message 
    });
  }
});

// OAuth callback - exchange code for session token (POST)
app.post('/api/auth/oauth/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code' });
    }

    const { session, user } = await clerk.auth.exchangeOauthCodeForToken({ code, state });
    const sessionToken = await clerk.sessions.getSessionToken(session.id);

    res.json({
      user: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      sessionToken,
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// OAuth callback - exchange code for session token (GET)
app.get('/api/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code' });
    }

    const { session, user } = await clerk.auth.exchangeOauthCodeForToken({ code, state });
    const sessionToken = await clerk.sessions.getSessionToken(session.id);

    res.json({
      user: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      sessionToken,
    });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// ========== PROTECTED ENDPOINTS ==========

// Get current session
app.get('/api/auth/session', requireAuth(), async (req, res) => {
  try {
    const user = await clerk.users.getUser(req.auth.userId);

    res.json({
      user: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      isSignedIn: true,
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(401).json({ error: 'Invalid session' });
  }
});

// Logout
app.post('/api/auth/logout', requireAuth(), async (req, res) => {
  try {
    await clerk.sessions.revokeAllSessions({ userId: req.auth.userId });
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user data
app.get('/api/user', requireAuth(), async (req, res) => {
  try {
    const user = await clerk.users.getUser(req.auth.userId);
    res.json({
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== START SERVER ==========

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
