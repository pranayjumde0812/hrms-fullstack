import { Request } from 'express';

const sanitizeIp = (value?: string | null) => {
  if (!value) {
    return null;
  }

  return value.replace('::ffff:', '');
};

export const extractRequestMetadata = (req: Request) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ipAddress = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim()
      : req.socket.remoteAddress;

  return {
    ipAddress: sanitizeIp(ipAddress),
    userAgent: req.get('user-agent') ?? null,
  };
};
