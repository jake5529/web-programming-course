import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { PrismaClient } from '@prisma/client' 
import { githubCallbackSchema } from '../utils/validation.js'

const prisma = new PrismaClient() 
const auth = new Hono()

// Типы и ошибки
type GitHubUser = {
  id: number;
  email?: string;
  name?: string;
};

class GitHubServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 400 | 500,
  ) {
    super(message);
    this.name = "GitHubServiceError";
  }
}

// MOCK данные
const MOCK_USERS: Record<string, GitHubUser> = {
  'test_code': {
    id: 12345,
    email: 'test@example.com',
    name: 'Test User'
  },
  'test_code_2': {
    id: 67890,
    email: 'test2@example.com',
    name: 'Test User 2'
  }
};

// Реальные функции GitHub
async function exchangeCodeForAccessToken(code: string): Promise<string> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new GitHubServiceError("GitHub credentials not configured", 500);
  }

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    },
  );

  const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };

  if (!tokenData.access_token) {
    throw new GitHubServiceError("Failed to get access token from GitHub", 400);
  }

  return tokenData.access_token;
}

async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const githubUser = await userResponse.json() as { id?: number; email?: string; name?: string };

  if (!githubUser.id) {
    throw new GitHubServiceError("Failed to get user data from GitHub", 400);
  }

  return {
    id: githubUser.id,
    email: githubUser.email,
    name: githubUser.name,
  };
}

async function getGitHubUserByCode(code: string): Promise<GitHubUser> {
  // Если code начинается с test_ - используем mock
  if (code.startsWith('test_')) {
    const mockUser = MOCK_USERS[code];
    if (mockUser) {
      return mockUser;
    }
    return {
      id: Math.floor(Math.random() * 1000000),
      email: `user_${code}@example.com`,
      name: `User ${code}`,
    };
  }

  // Иначе - реальный GitHub OAuth
  const accessToken = await exchangeCodeForAccessToken(code);
  return getGitHubUser(accessToken);
}

// POST /api/auth/github/callback
auth.post('/github/callback', async (c) => {
  try {
    const body = await c.req.json()
    
    const validation = githubCallbackSchema.safeParse(body)
    
    if (!validation.success) {
      return c.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, 400)
    }

    const { code } = validation.data

    // Получаем данные пользователя
    let githubUser
    try {
      githubUser = await getGitHubUserByCode(code)
    } catch (error) {
      if (error instanceof GitHubServiceError) {
        return c.json({ error: error.message }, error.statusCode)
      }
      return c.json({ error: 'GitHub authentication failed' }, 500)
    }

    // Сохраняем в базу
    const githubId = String(githubUser.id)
    const user = await prisma.user.upsert({
      where: { githubId },
      update: {
        name: githubUser.name,
        email: githubUser.email || `${githubId}@github.user`,
      },
      create: {
        githubId,
        name: githubUser.name || `User ${githubId}`,
        email: githubUser.email || `${githubId}@github.user`,
      },
    })

    // Создаем JWT токен
    const payload = {
      sub: user.id,
      githubId: user.githubId,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    }

    const secret = process.env.JWT_SECRET || 'dev-secret-key'
    const token = await sign(payload, secret)

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubId: user.githubId
      }
    })

  } catch (error) {
    console.error('error:', error)
    return c.json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/auth/me
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header'
      }, 401)
    }

    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET || 'dev-secret-key'
    const payload = await verify(token, secret, 'HS256')

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string }
    })

    if (!user) {
      return c.json({ 
        success: false,
        error: 'User not found'
      }, 404)
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubId: user.githubId
      }
    })

  } catch (error) {
    return c.json({ 
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token'
    }, 401)
  }
})

export default auth