import { Elysia, t } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { jwt } from '@elysiajs/jwt';
import bcrypt from 'bcryptjs';

// Add this type declaration to extend the request context
type AppContext = {
  user?: {
    id: number;
    email: string;
    username: string;
  };
}

const prisma = new PrismaClient();

// Authentication middleware
const auth = new Elysia()
  .use(jwt({ secret: process.env.JWT_SECRET! }))
  .derive(async ({ jwt, headers }) => {
    const authHeader = headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) return { user: null };
    
    const token = authHeader.split(' ')[1];
    if (!token) return { user: null };
    
    const payload = await jwt.verify(token);
    if (!payload) return { user: null };
    
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, email: true, username: true }
    });
    
    return { user };
  });

// API Routes
export const api = new Elysia({ prefix: '/api' })
  .use(auth)
  .derive(async (context) => {
    return {
      user: context.user
    }
  })
  // Auth routes
  .post('/auth/signup', async ({ body }) => {
    const { email, username, password } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        profile: { create: {} }
      }
    });
    
    return { id: user.id, email: user.email, username: user.username };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      username: t.String({ minLength: 3 }),
      password: t.String({ minLength: 8 })
    })
  })
  .post('/auth/login', async ({ body, jwt, cookie: { auth } }) => {
    const { email, password } = body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');
    
    const token = await jwt.sign({ sub: String(user.id) });    
    auth.value = token;
    
    return { token };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
  
  // Post routes
  .post('/posts', async ({ body, user }: { body: any; user?: AppContext['user'] }) => {
    if (!user) throw new Error('Unauthorized');
    
    const post = await prisma.post.create({
      data: {
        ...body,
        authorId: user.id,
        tags: {
          connectOrCreate: body.tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      }
    });
    
    return post;
  }, {
    body: t.Object({
      title: t.String(),
      description: t.Optional(t.String()),
      audioUrl: t.String(),
      duration: t.Number(),
      waveform: t.Optional(t.Any()),
      isPublic: t.Optional(t.Boolean()),
      tags: t.Array(t.String())
    })
  })
  .get('/posts', async ({ query }) => {
    const posts = await prisma.post.findMany({
      where: { isPublic: true },
      include: {
        author: {
          select: { username: true, profile: { select: { avatarUrl: true } } }
        },
        tags: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: Number(query.page || 0) * 20
    });
    
    return posts;
  }, {
    query: t.Object({
      page: t.Optional(t.Numeric())
    })
  })
  
  // Comment routes
  .post('/posts/:postId/comments', async ({ body, user, params }: { body: any; user?: AppContext['user']; params: { postId: string } }) => {
    if (!user) throw new Error('Unauthorized');
    
    const comment = await prisma.comment.create({
      data: {
        ...body,
        postId: Number(params.postId),
        authorId: user.id
      }
    });
    
    return comment;
  }, {
    params: t.Object({
      postId: t.Numeric()
    }),
    body: t.Object({
      content: t.String(),
      timestamp: t.Optional(t.Number())
    })
  })
  .get('/posts/:postId/comments', async ({ params }) => {
    const comments = await prisma.comment.findMany({
      where: { postId: Number(params.postId) },
      include: {
        author: {
          select: { username: true, profile: { select: { avatarUrl: true } } }
        }
      },
      orderBy: { timestamp: 'asc' }
    });
    
    return comments;
  }, {
    params: t.Object({
      postId: t.Numeric()
    })
  });
