// Imports published posts from a Notion database into Hugo page bundles
// at content/posts/notion/{slug}/index.md, downloading inline images
// alongside the markdown file.
//
// Required env vars:
//   NOTION_TOKEN  - integration token with read access to the database
//   DATABASE_ID   - the Notion database to query

const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const path = require("path");
const fs = require("fs");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

const root = path.join("content", "posts");

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fmDate = (iso) => iso.slice(0, 10);

const getBlockChildren = async (blockId) => {
  const result = [];
  let cursor;
  do {
    const resp = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    });
    result.push(...resp.results);
    cursor = resp.next_cursor;
  } while (cursor);
  let n = 0;
  for (const b of result) {
    if (b.type === "numbered_list_item") {
      b.numbered_list_item.number = ++n;
    } else {
      n = 0;
    }
  }
  return result;
};

const downloadImage = async (url, dest) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
};

const buildFrontmatter = (props, published, notionId) => {
  const date =
    props.Date?.date?.start ?? props.created_time ?? new Date().toISOString();
  const title = props.Post?.title?.[0]?.plain_text ?? "untitled";
  const slugProp = props.Slug?.rich_text?.[0]?.plain_text?.trim();
  const tags = (props.Tags?.multi_select ?? []).map((t) => t.name);
  const cats = (props.Categories?.multi_select ?? []).map((t) => t.name);
  const canonical = props["Canonical URL"]?.url;

  let fm = "---\n";
  fm += `date: ${fmDate(date)}\n`;
  fm += `title: ${JSON.stringify(title)}\n`;
  if (slugProp) fm += `slug: ${JSON.stringify(slugify(slugProp))}\n`;
  if (tags.length) fm += `tags:\n${tags.map((t) => `  - ${t}`).join("\n")}\n`;
  if (cats.length)
    fm += `categories:\n${cats.map((t) => `  - ${t}`).join("\n")}\n`;
  if (canonical) fm += `canonical_url: ${canonical}\n`;
  if (!published) fm += `draft: true\n`;
  fm += `notion_id: ${notionId}\n`;
  fm += "---\n\n";
  return { fm, title, slug: slugProp ? slugify(slugProp) : slugify(title) };
};

const readNotionId = (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  const head = fs.readFileSync(filePath, "utf8").split(/\r?\n/, 30);
  for (const line of head) {
    const m = line.match(/^notion_id:\s*(\S+)/);
    if (m) return m[1];
  }
  return null;
};

(async () => {
  if (!process.env.NOTION_TOKEN || !process.env.DATABASE_ID) {
    console.error("NOTION_TOKEN and DATABASE_ID must be set");
    process.exit(1);
  }

  fs.mkdirSync(root, { recursive: true });

  const pages = [];
  let cursor;
  do {
    const resp = await notion.databases.query({
      database_id: process.env.DATABASE_ID,
      filter: { property: "Publish", checkbox: { equals: true } },
      start_cursor: cursor,
    });
    pages.push(...resp.results);
    cursor = resp.has_more ? resp.next_cursor : undefined;
  } while (cursor);

  for (const page of pages) {
    const published = page.properties.Publish?.checkbox === true;
    const props = { ...page.properties, created_time: page.created_time };
    const { fm, slug } = buildFrontmatter(props, published, page.id);

    const bundleDir = path.join(root, slug);
    const indexPath = path.join(bundleDir, "index.md");
    const existingId = readNotionId(indexPath);
    if (existingId && existingId !== page.id) {
      console.warn(
        `skip ${slug}: bundle exists with different notion_id (${existingId})`,
      );
      continue;
    }
    if (!existingId && fs.existsSync(indexPath)) {
      console.warn(`skip ${slug}: bundle exists without notion_id`);
      continue;
    }
    fs.mkdirSync(bundleDir, { recursive: true });

    const blocks = await getBlockChildren(page.id);

    for (const b of blocks) {
      if (b.type === "image" && b.image.type === "file") {
        const url = new URL(b.image.file.url);
        let fileName = path.basename(url.pathname);
        const caption = b.image.caption?.[0]?.plain_text;
        if (caption) {
          fileName =
            caption.replace(/[^a-z0-9]/gi, "_").toLowerCase() +
            path.extname(fileName);
        }
        await downloadImage(url, path.join(bundleDir, fileName));
        b.image.type = "external";
        b.image.external = { url: `./${fileName}` };
      }
    }

    const md = n2m.toMarkdownString(await n2m.blocksToMarkdown(blocks)).parent;
    fs.writeFileSync(path.join(bundleDir, "index.md"), fm + md);
    console.log(`wrote ${bundleDir}/index.md`);
  }
})();
