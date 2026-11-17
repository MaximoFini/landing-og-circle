import Image from 'next/image';
import type { Metadata } from 'next';

// Página servida por middleware.ts cuando MAINTENANCE_MODE=true (rewrite +
// 503). Visitarla directo sin el middleware activo también funciona (devuelve
// 200 igual), por si alguna vez hace falta linkearla a mano.
export const metadata: Metadata = {
  title: 'Algo grande se viene — OG Circle by VEGROUP',
  robots: { index: false, follow: false },
};

export default function MantenimientoPage() {
  return (
    <main className="maintenance-page">
      <div className="wrap maintenance-page__inner">
        <Image
          src="/images/logo-icon.png"
          alt="OG Circle by VEGROUP"
          width={40}
          height={46}
          className="maintenance-page__logo"
          priority
        />
        <span className="tag-label">Próximamente</span>
        <h1 className="maintenance-page__title">
          Se viene algo <span className="text-gradient">grande</span>.
        </h1>
        <p className="lede maintenance-page__lede">
          Estamos preparando la primera versión de OG Circle.
        </p>
      </div>
    </main>
  );
}
