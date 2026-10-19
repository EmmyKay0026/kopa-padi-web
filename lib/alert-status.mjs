export function alertStatusMessage(result, fallback) {
  if (result?.status === 'NO_ELIGIBLE_RECIPIENTS') return 'No eligible email recipients. Phone-only contacts cannot receive email. Contact someone directly if you need help.';
  if (result?.status === 'QUEUED') return `${result.queued ?? 0} email notification(s) queued, not confirmed delivered. Contact someone directly if urgent.`;
  return fallback;
}
