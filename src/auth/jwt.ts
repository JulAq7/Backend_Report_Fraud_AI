/**
 * JWT firmado con HMAC-SHA256, construido manualmente con `node:crypto`.
 *
 * Formato: `base64url(header).base64url(payload).base64url(firma)`.
 * El servidor no guarda los tokens; los verifica recalculando la firma
 * con la misma llave secreta.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

// Llave con la que firmamos los tokens, definida en el archivo .env.
function getSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET no está configurado en el archivo .env');
  }

  return secret;
}

/**
 * Información que viaja dentro del JWT.
 *
 * `sub` corresponde al id del usuario autenticado.
 * `idRol` se usa para aplicar permisos según el rol del usuario.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  idRol: number;

  /** Distingue entre tokens para acceso y tokens para renovación. */
  type: 'access' | 'refresh';

  /** Momento de emisión en segundos Unix. */
  iat: number;

  /** Momento de expiración en segundos Unix. */
  exp: number;
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

function b64url(json: object): string {
  return Buffer.from(JSON.stringify(json)).toString('base64url');
}

function hmac(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('base64url');
}

/**
 * Firma un payload y genera un JWT.
 * @param payload - Claims del usuario sin `iat` ni `exp`.
 * @param ttlSeconds - Tiempo de vida del token en segundos.
 * @returns El JWT con formato `header.payload.firma`.
 */
export function sign(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  ttlSeconds: number,
): string {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const body = b64url({
    ...payload,
    iat: now(),
    exp: now() + ttlSeconds,
  });
  const signature = hmac(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
}

/**
 * Verifica la estructura, firma y expiración de un JWT.
 * @param token - Token recibido sin el prefijo `Bearer `.
 * @returns El payload si el token es válido; `null` si está mal formado,
 * tiene una firma incorrecta o ya expiró.
 */
export function verify(token: string): JwtPayload | null {
  const [header, body, signature] = token.split('.');

  if (!header || !body || !signature) {
    return null;
  }

  const esperada = Buffer.from(hmac(`${header}.${body}`));
  const recibida = Buffer.from(signature);

  if (
    esperada.length !== recibida.length ||
    !timingSafeEqual(esperada, recibida)
  ) {
    return null;
  }

  const payload = JSON.parse(
    Buffer.from(body, 'base64url').toString(),
  ) as JwtPayload;

  if (payload.exp < now()) {
    return null;
  }

  return payload;
}