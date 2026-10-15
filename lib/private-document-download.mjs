export async function downloadPrivateDocument(url) {
  const response = await fetch(url, {credentials:'include',cache:'no-store'});
  if (!response.ok) throw new Error(`Document download failed (${response.status}). Please sign in again or check your review permission.`);
  const mime = response.headers.get('content-type')?.split(';')[0];
  const extension = {'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg'}[mime];
  if (!extension) throw new Error('The server did not return a verification document.');
  const blob = await response.blob();
  if (!blob.size) throw new Error('The document is empty. Please try again.');
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `verification-document.${extension}`;
  document.body.appendChild(link);
  try { link.click(); }
  finally { link.remove(); setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000); }
  return {bytes:blob.size,mimeType:mime};
}
