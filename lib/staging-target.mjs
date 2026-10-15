const productionApi = 'https://api.kopa-padi.corper-paddy.com.ng';
export function previewApiTarget(value) {
  if (!value) throw new Error('STAGING_API_URL is required for previews; production fallback is forbidden');
  const url = new URL(value);
  const hostname = url.hostname.replace(/\.$/, '');
  if (url.protocol !== 'https:' || hostname === new URL(productionApi).hostname || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Preview API must be an explicit non-production HTTPS origin');
  }
  return url.origin;
}
export function previewBuildTarget(stagingValue, publicValue) {
  const target=previewApiTarget(stagingValue);
  if (!publicValue || previewApiTarget(publicValue)!==target) throw new Error('NEXT_PUBLIC_API_URL must match STAGING_API_URL at preview build time');
  return target;
}
