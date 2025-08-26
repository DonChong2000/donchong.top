
import { glob } from 'fast-glob';
import path from 'path';
import { notFound } from 'next/navigation';

const contentDir = path.join(process.cwd(), 'content', 'cookbook');

async function getAttachments() {
  const files = await glob('*.mdx', { cwd: contentDir });

  return files.map((file) => {
    const slug = path.basename(file, path.extname(file));
    return { slug };
  });
}

export const allAttachments = await getAttachments();

export async function generateStaticParams() {
  return allAttachments.map((attachment) => ({
    slug: attachment.slug,
  }));
}

async function getPageContent(slug: string) {
  try {
    // Dynamically import the MDX file.
    // The path is relative from the `content` directory.
    const { default: Content } = await import(
      `@/app/content/cookbook/${slug}.mdx`
    );
    return <Content />;
  } catch (error) {
    notFound();
  }
}

export default async function AttachmentPage({
  params,
}: {
  params: { slug: string }
}) {
  const pageContent = await getPageContent(params.slug);

  return <article className="prose dark:prose-invert">{pageContent}</article>;
}
