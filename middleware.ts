import { NextResponse, type NextRequest } from 'next/server';

// ─── Modo mantenimiento ─────────────────────────────────────────────────
// Corta la landing entera antes de que Next renderice nada, así nunca
// depende de que el resto de la app (layout, componentes, CSS) siga sano.
//
// Activación: variable de entorno MAINTENANCE_MODE=true en el hosting
// (ver app/lib/maintenance.ts para el detalle de cada variable).
//
// SEO: responde 503 + Retry-After en vez de 200 o 404. Un 503 temporal le
// dice a Google "no me indexes esto, volvé después" sin tocar el índice
// existente; un 200 indexaría la página de mantenimiento, y un 404 puede
// hacer que Google empiece a sacar la URL del índice si dura varios días
// (VGRP — pedido del cliente, nov 2026).
//
// Bypass de preview: ?preview=<clave> deja una cookie httpOnly de 30 días
// y redirige a la misma URL sin el query param (para no dejarlo pegado en
// el historial/analytics). Sin esa clave, cualquiera ve la página de
// mantenimiento, incluso el propio equipo.
export const config = {
  // Corre en todo excepto los assets de Next y los íconos/manifest de la
  // raíz: si esos quedan bloqueados, la página de mantenimiento misma
  // pierde su favicon y el manifest tira 503 en el devtools sin razón.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|opengraph-image.png|manifest.webmanifest|robots.txt|sitemap.xml).*)',
  ],
};

const BYPASS_COOKIE = 'og_preview';

export default function middleware(req: NextRequest) {
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';
  if (!isMaintenance) return NextResponse.next();

  const { searchParams, pathname } = req.nextUrl;
  const previewKey = process.env.MAINTENANCE_PREVIEW_KEY;

  // 1) ?preview=<clave> correcta → planta la cookie y limpia la URL.
  const suppliedKey = searchParams.get('preview');
  if (previewKey && suppliedKey === previewKey) {
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.searchParams.delete('preview');
    const res = NextResponse.redirect(cleanUrl);
    res.cookies.set(BYPASS_COOKIE, previewKey, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    });
    return res;
  }

  // 2) Cookie de preview ya presente y válida → deja pasar.
  const cookieKey = req.cookies.get(BYPASS_COOKIE)?.value;
  if (previewKey && cookieKey === previewKey) return NextResponse.next();

  // 3) Nunca bloquear la propia página de mantenimiento ni sus assets.
  if (pathname === '/mantenimiento') return NextResponse.next();

  // 4) Resto de los visitantes → página de mantenimiento con 503.
  const url = req.nextUrl.clone();
  url.pathname = '/mantenimiento';
  const rewritten = NextResponse.rewrite(url);
  rewritten.headers.set('Retry-After', '21600'); // 6 horas, valor orientativo
  rewritten.headers.set('X-Robots-Tag', 'noindex');
  return new NextResponse(rewritten.body, {
    status: 503,
    headers: rewritten.headers,
  });
}
