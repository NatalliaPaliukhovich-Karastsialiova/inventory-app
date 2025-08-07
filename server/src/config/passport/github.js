import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from "../db.js";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

        let user = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              fullName: profile.displayName || profile.username,
              accounts: {
                create: {
                  provider: 'github',
                  providerId: profile.id,
                },
              },
            },
            include: { accounts: true },
          });
        } else {
          const existingAccount = user.accounts.find(
            acc => acc.provider === 'github' && acc.providerId === profile.id
          );

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                provider: 'github',
                providerId: profile.id,
                userId: user.id,
              },
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
