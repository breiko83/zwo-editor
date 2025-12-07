const AWS = require('aws-sdk')
const { MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  credentials: new AWS.Credentials(MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY),
  region: 'eu-west-1',
})

exports.handler = function (event, context, callback) {  
  // Allow both localhost and production origins
  const origin = event.headers.origin || event.headers.Origin || 'http://localhost:8888'
  const allowedOrigins = [
    'http://localhost:8888',
    'http://localhost:3000',
    'https://www.zwiftworkout.com',
    'https://zwiftworkout.netlify.app'
  ]
  const corsUrl = allowedOrigins.includes(origin) ? origin : 'https://www.zwiftworkout.com'

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': corsUrl,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    })
  }

  const body = JSON.parse(event.body)
  const { fileName, fileType } = body

  if (!fileName && !fileType) {
    return {
      statusCode: 400,
      headers: {
        /* Required for CORS support to work */
        'Access-Control-Allow-Origin': corsUrl,
        /* Required for cookies, authorization headers with HTTPS */
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Missing fileName or fileType on body'
      }),
    }
  }

  const s3Params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
    
    ACL: 'public-read', /* Note: change if files are NOT public */
    /* Optionally add additional data
    Metadata: {
      foo: 'bar',
      lol: 'hi'
    }
    */
  }

  const uploadURL = s3.getSignedUrl('putObject', s3Params)

  callback(null, {
    statusCode: 200,
    headers: {
      /* Required for CORS support to work */
      'Access-Control-Allow-Origin': corsUrl,
      /* Required for cookies, authorization headers with HTTPS */
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadURL: uploadURL
    }),
  })
}