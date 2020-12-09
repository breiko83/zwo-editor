const AWS = require('aws-sdk')
const { MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env

const s3 = new AWS.S3({
  signatureVersion: 'v4',
  credentials: new AWS.Credentials(MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY),
  region: 'eu-west-1',
})

exports.handler = function (event, context, callback) {

  console.log(event);
  

  const body = JSON.parse(event.body)
  const { fileName, fileType } = body

  if (!fileName && !fileType) {
    return {
      statusCode: 400,
      headers: {
        /* Required for CORS support to work */
        'Access-Control-Allow-Origin': 'https://www.zwiftworkout.com',
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
      'Access-Control-Allow-Origin': 'https://www.zwiftworkout.com',
      /* Required for cookies, authorization headers with HTTPS */
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadURL: uploadURL
    }),
  })
}