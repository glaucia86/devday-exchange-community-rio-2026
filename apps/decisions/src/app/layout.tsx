import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Mesa TI · DevDay Exchange Rio',description:'Um laboratório comunitário sobre voz, decisões tipadas e revisão humana. Dados e tickets fictícios.'};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
