export function fixCors(header: Record<string, string[]>) {
  if (header['Access-Control-Allow-Origin']) {
    header['Access-Control-Allow-Origin'] = ['*'];
  } else if (header['access-control-allow-origin']) {
    header['access-control-allow-origin'] = ['*'];
  } else {
    return {
      'Access-Control-Allow-Origin': ['*'],
      // We use this to bypass headers
      'Access-Control-Allow-Headers': ['*'],
      ...header,
    }
  }
  return header
}