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
    // Get reference to users and workouts nodes
    const db = admin.database();
    const usersRef = db.ref('users');
    const workoutsRef = db.ref('workouts');
    console.log('References obtained');
    
    // Get snapshots and count children
    const [usersSnapshot, workoutsSnapshot] = await Promise.all([
      usersRef.once('value'),
      workoutsRef.once('value')
    ]);
    
    const usersCount = usersSnapshot.numChildren();
    const workoutsCount = workoutsSnapshot.numChildren();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': corsUrl,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      },
      body: JSON.stringify({ 
        usersCount,
        workoutsCount 
      })
    };
  } catch (error) {
    console.error('Error getting users count:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': corsUrl,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to get users count' })
    };
  }
};
