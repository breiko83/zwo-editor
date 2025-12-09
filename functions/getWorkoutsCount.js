const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

exports.handler = async function (event, context) {
  // Allow both localhost and production origins
  const origin = event.headers.origin || event.headers.Origin || 'http://localhost:8888';
  const allowedOrigins = [
    'http://localhost:8888',
    'http://localhost:3000',
    'https://www.zwiftworkout.com',
    'https://zwiftworkout.netlify.app'
  ];
  const corsUrl = allowedOrigins.includes(origin) ? origin : 'https://www.zwiftworkout.com';

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': corsUrl,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': corsUrl,
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const db = admin.database();
    console.log('Getting workouts count');
    
    // Use shallow query to get only keys, not full data
    const workoutsSnapshot = await db.ref('workouts').once('value', null, { shallow: true });
    
    // Count the keys
    const count = workoutsSnapshot.exists() ? Object.keys(workoutsSnapshot.val() || {}).length : 0;
    
    console.log('Workouts count:', count);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': corsUrl,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      },
      body: JSON.stringify({ count })
    };
  } catch (error) {
    console.error('Error getting workouts count:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': corsUrl,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to get workouts count' })
    };
  }
};
