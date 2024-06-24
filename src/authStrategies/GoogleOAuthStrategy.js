import OAuth2Strategy from "passport-oauth2";
import axios from "axios";
import payload from 'payload';
import crypto from 'crypto';
require("dotenv").config();

// Google OAuth Strategy for Passport
const GoogleOAuthStrategy = new OAuth2Strategy({
    // OAuth configuration
		// important to note is the scope of the requested information
    authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile",
    tokenURL: "https://accounts.google.com/o/oauth2/token",
    clientID: process.env.GOOGLE_CLIENT_ID, // Google Client ID from environment variables
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google Client Secret from environment variables
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // Callback URL for Google OAuth
  },
  // Verification function
  async function (accessToken, refreshToken, profile, cb) {
    // Fetch user profile from Google
    try {
      const userProfileURL = "https://www.googleapis.com/oauth2/v3/userinfo";
      const response = await axios.get(userProfileURL, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const userData = response.data;
      
      // Extract necessary data from user profile
      const email = userData.email;
      const sub = userData.email;
      const pictureUrl = userData.picture;
      const collectionSlug = "users";

      // Find or create user in the database
      let user = await findOrCreateUser(collectionSlug, sub, email, pictureUrl);

      // Pass the user to the callback
      cb(null, user);
    } catch (e) {
      console.error('Authentication failed:', e);
      cb(e);
    }
  }
);

// Helper function to find or create user
async function findOrCreateUser(collectionSlug, sub, email, pictureUrl) {
  let users = await payload.find({
    collection: collectionSlug,
    where: { sub: { equals: sub } },
    showHiddenFields: true,
  });

  // If user exists, return the user
  if (users.docs && users.docs.length) {
    let user = users.docs[0];
    user.collection = collectionSlug;
    user._strategy = "googleOauth";
    return user;
  } else {
    // Generate a secure random password
    const randomPassword = crypto.randomBytes(20).toString('hex');

    // Register new user
    return await payload.create({
      collection: collectionSlug,
      data: {
        email: email,
        sub: sub,
        pictureURL: pictureUrl,
        password: randomPassword,
      },
      showHiddenFields: true,
    });
  }
}

export default GoogleOAuthStrategy;