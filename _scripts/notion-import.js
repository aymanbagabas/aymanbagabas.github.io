const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const https = require("https");
const fetch = require("node-fetch");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient: notion });

const getBlockChildren = async (notionClient, block_id, totalPage) => {
  try {
    let result = [];
    let pageCount = 0;
    let start_cursor = undefined;

    do {
      const response = await notionClient.blocks.children.list({
        start_cursor: start_cursor,
        block_id: block_id,
      });
      result.push(...response.results);

      start_cursor = response?.next_cursor;
      pageCount += 1;
    } while (
      start_cursor != null &&
      (totalPage == null || pageCount < totalPage)
    );

    modifyNumberedListObject(result);
    return result;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const modifyNumberedListObject = (blocks) => {
  let numberedListIndex = 0;

  for (const block of blocks) {
    if ("type" in block && block.type === "numbered_list_item") {
      // add numbers
      // @ts-ignore
      block.numbered_list_item.number = ++numberedListIndex;
    } else {
      numberedListIndex = 0;
    }
  }
};

(async () => {
  // ensure directory exists
  const root = path.join("_posts", "notion");
  fs.mkdirSync(root, { recursive: true });

  const databaseId = process.env.DATABASE_ID;
  // TODO has_more
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Publish",
      checkbox: {
        equals: true,
      },
    },
  });
  for (const r of response.results) {
    // console.log(r)
    const id = r.id;
    // date
    let date = moment(r.created_time).format("YYYY-MM-DD");
    let pdate = r.properties?.["Date"]?.["date"]?.["start"];
    if (pdate) {
      date = moment(pdate).format("YYYY-MM-DD");
    }
    // title
    let title = id;
    let ptitle = r.properties?.["Post"]?.["title"];
    if (ptitle?.length > 0) {
      title = ptitle[0]?.["plain_text"];
    }
    // tags
    let tags = [];
    let ptags = r.properties?.["Tags"]?.["multi_select"];
    for (const t of ptags) {
      const n = t?.["name"];
      if (n) {
        tags.push(n);
      }
    }
    // categories
    let cats = [];
    let pcats = r.properties?.["Categories"]?.["multi_select"];
    for (const t of pcats) {
      const n = t?.["name"];
      if (n) {
        tags.push(n);
      }
    }
    // comments
    const comments = r.properties?.["No Comments"]?.["checkbox"] == false;
    // frontmatter
    let fmtags = "";
    let fmcats = "";
    if (tags.length > 0) {
      fmtags += "\ntags:\n";
      for (const t of tags) {
        fmtags += "  - " + t + "\n";
      }
    }
    if (cats.length > 0) {
      fmcats += "\ncategories:\n";
      for (const t of cats) {
        fmcats += "  - " + t + "\n";
      }
    }
    let fm = `---
layout: post
comments: ${comments}
date: ${date}
title: ${title}${fmtags}${fmcats}
`;
    const canonical = r.properties?.["Canonical URL"]?.["url"];
    if (canonical) {
      fm += "canonical_url: ${canonical}\n";
    }

    fm += "---\n";

    // post title
    const pftitle = `${date}-${title.replaceAll(" ", "-").toLowerCase()}`;

    const blocks = await getBlockChildren(notion, id);
    for (const b of blocks) {
      if (b.type === "image" && b.image.type === "file") {
        const url = new URL(b.image.file.url);
        let fileName = path.basename(url.pathname);
        if (b.image.caption?.length > 0) {
          const caption = b.image.caption[0]?.["plain_text"];
          if (caption) {
            fileName =
              caption.replace(/[^a-z0-9]/gi, "_").toLowerCase() +
              path.extname(fileName);
          }
        }
        let img = Buffer.alloc(0);
        await fetch(url)
          .then((res) => res.buffer())
          .then((buf) => (img = buf));
        // make sure parent directory exists
        const parent = path.join("assets", "images", pftitle);
        fs.mkdirSync(parent, { recursive: true });
        fs.writeFileSync(path.join(parent, fileName), img);
        // replace image url with local path
        b.image.type = "external";
        b.image["external"] = {
          url: "/" + path.join(parent, fileName),
        };
      }
    }

    // generate markdown file
    const md = n2m.toMarkdownString(await n2m.blocksToMarkdown(blocks));

    // writing to file
    const ftitle = `${pftitle}.md`;
    fs.writeFile(path.join(root, ftitle), fm + md, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
})();