import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from "../db.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        let user = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              fullName: profile.displayName || profile.username,
              avatar: profile.photos?.[0]?.value,
              familyName: profile.name?.familyName,
              givenName: profile.name?.givenName,
              accounts: {
                create: {
                  provider: 'google',
                  providerId: profile.id,
                },
              },
            },
            include: { accounts: true },
          });
        } else {
          const existingAccount = user.accounts.find(
            acc => acc.provider === 'google' && acc.providerId === profile.id
          );

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                provider: 'google',
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
