export default async function upload(id: string, file: Blob): Promise<void> {
  const res = await fetch('https://zwiftworkout.netlify.app/.netlify/functions/upload', {
    method: 'POST',
    body: JSON.stringify(
      {
        fileType: 'zwo',
        fileName: `${id}.zwo`
      })
  });

  // upload to S3
  await fetch((await res.json()).uploadURL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'zwo'
    },
    body: file
  });
}
