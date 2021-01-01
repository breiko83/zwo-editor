const S3_URL = 'https://zwift-workout.s3-eu-west-1.amazonaws.com';

export default function download(id: string): Promise<string> {
  return fetch(`${S3_URL}/${id}.zwo`).then(response => response.text());
}
