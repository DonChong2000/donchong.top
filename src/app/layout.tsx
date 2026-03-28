import { type Metadata } from 'next';
import glob from 'fast-glob';
import Script from 'next/script';

import { Providers } from '@/app/providers';
import { Layout } from '@/components/Layout';
import { type Section } from '@/components/SectionProvider';
import EasterEgg from '@/components/EasterEgg';

import '@/styles/tailwind.css';
import path from 'path';

export const metadata: Metadata = {
  title: {
    template: '%s - Don Chong',
    default: 'Don Chong',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let pages = await glob('**/*.mdx', { cwd: 'src/app' });
  let allSectionsEntries = (await Promise.all(
    pages.map(async (filename) => [
      '/' + filename.replace(/(^|\/)(page\.mdx)$/, ''),
      (await import(`./${filename}`)).sections,
    ]),
  )) as Array<[string, Array<Section>]>;

  const cookbookPages = await glob('content/cookbook/*.mdx', {
    cwd: 'src/app',
  });

  const cookbookSectionsEntries = (await Promise.all(
    cookbookPages.map(async (filename) => {
      const slug = path.basename(filename, path.extname(filename));
      const sections = (await import(`./${filename}`)).sections;
      return [`/cookbook/${slug}`, sections];
    }),
  )) as Array<[string, Array<Section>]>;

  const allSections = Object.fromEntries([
    ...allSectionsEntries,
    ...cookbookSectionsEntries,
  ]);

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full bg-white antialiased dark:bg-charcoal-800">
        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-188JTTH07H"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-188JTTH07H');
          `}
        </Script>
        <Providers>
          <EasterEgg />
          <div className="w-full">
            <Layout allSections={allSections}>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  );
}