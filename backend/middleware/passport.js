import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import AppleStrategy from "passport-apple";
import { User } from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account does not have an email"), null);

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email,
            googleId: profile.id,
            authType: "google",
            profileImage: profile.photos?.[0]?.value || "",
            role: "user",
          });

          await user.save({ validateBeforeSave: false });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Facebook account has no email"), null);

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            email,
            facebookId: profile.id,
            authType: "facebook",
            profileImage: profile.photos?.[0]?.value || "",
            role: "user",
          });

          await user.save({ validateBeforeSave: false });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      callbackURL: process.env.APPLE_CALLBACK_URL,
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        const email = idToken.email; // Email is only available the first time
        const name = `${idToken.firstName || "Apple"} ${idToken.lastName || "User"}`;

        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            name,
            email,
            appleId: idToken.sub,
            password: null,
            authType: "apple",
            profileImage: "", // Apple doesn’t provide profile pictures
            role: "user",
          });
          await user.save({ validateBeforeSave: false });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
