import Providers from './providers';
import './globals.css';

export const metadata = {
  title: 'Strava App',
  description: 'Aplicação integrada com Strava API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}