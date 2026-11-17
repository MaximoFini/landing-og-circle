import type { Metadata } from 'next';

// Página servida por middleware.ts cuando MAINTENANCE_MODE=true (rewrite +
// 503). Visitarla directo sin el middleware activo también funciona (devuelve
// 200 igual), por si alguna vez hace falta linkearla a mano.
export const metadata: Metadata = {
  title: 'Volvemos pronto — OG Circle by VEGROUP',
  robots: { index: false, follow: false },
};

const WHATSAPP_MESSAGE = `Hola, vengo de la web de VeGroup.
Tengo una duda sobre OG Circle: `;
const WHATSAPP_HREF = `https://wa.me/5491176392303?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function MantenimientoPage() {
  return (
    <main className="error-page">
      <div className="wrap error-page__inner">
        <span className="tag-label">Pausa breve</span>
        <h2 className="error-page__title">Estamos actualizando el sitio</h2>
        <p className="lede error-page__lede">
          Volvemos a estar en línea en las próximas horas. Si necesitás algo
          urgente, escribinos por WhatsApp.
        </p>
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gradient error-page__btn"
        >
          Escribir por WhatsApp
        </a>
      </div>
    </main>
  );
}
