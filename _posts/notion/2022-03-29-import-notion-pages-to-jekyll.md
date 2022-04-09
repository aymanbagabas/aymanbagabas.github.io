---
layout: post
comments: true
date: 2022-03-29
title: Import Notion Pages to Jekyll
tags:
  - jekyll
  - notion

---

Lately, I started using Notion for note-taking, to-do lists, and now for writing blog posts. Notion makes it simple to combine all those activities in a unified pretty interface. Using Jekyll, Github Pages, and Github Actions, I was able to import my Notion Blog database posts into Jekyll using a Github workflow that runs twice a day.

![My Notion Blog database](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/e93d2eeb-9f9e-46e3-9e81-181a939cbb68/Untitled.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220409%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220409T025000Z&X-Amz-Expires=3600&X-Amz-Signature=3fc252ed57912d5be0782555109804c014e9b432d4ab02c4f4efe566ea3f9994&X-Amz-SignedHeaders=host&x-id=GetObject)

# What is a Notion Database?

[Notion databases](https://www.notion.so/help/guides/creating-a-database) are smart tables that can hold a collection of pages with customizable properties and multiple layouts. Think of it as smart spreadsheets on steroids.

# The Layout

Jekyll uses YAML front matter to specify post title, date, tags, and other properties. Using Notion databases properties, we can map Jekyll YAML front matter into a simple Notion Database. Each entry in the database corresponds to a Jekyll post with its respective front matter properties. The script will use the date specified as the published date for the post, it will default to the entry creation date if one was not specified. If you want a page to be published, simply check the “Publish” checkbox.

# The Script

Writing the importer script was a breeze using [Notion JavaScript SDK](https://github.com/makenotion/notion-sdk-js) and [souvikinator/notion-to-md](https://github.com/souvikinator/notion-to-md). The SDK pulls the entries in the database, then the converter converts each Notion page into Markdown ready to be used in Jekyll.

To use the script, first, you have to create a new Notion integration that can access your Blog page database. Simply go to settings, choose integrations, click on “develop your own integration” and create a new integration with the proper scopes.

![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/b9ae53ab-a4de-4b31-84bf-8b95b8aef7e3/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220409%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220409T025000Z&X-Amz-Expires=3600&X-Amz-Signature=c9cb8e3ae49a5f92a508542c374d836f8974845b238415a5072b99ca41e79f25&X-Amz-SignedHeaders=host&x-id=GetObject)

After creating that, you will get an integration key that would be used later with the script for it to work. But before that, you will need to invite your newly created integration bot to the Notion page that has the database that you want to use. Simply click the “share” button on the database page and invite the integration you just created. It will have the same name you specified when you created the integration.

This is how the script works:

```javascript
// Create a Notion client from an environment variable
const notion = new Client({
	auth: process.env.NOTION_TOKEN,
});

// Query the database and filter out unpublished entries
const response = await notion.databases.query({
		database_id: process.env.DATABASE_ID,
		filter: {
			property: "Publish",
			checkbox: {
				equals: true
			}
		}
	})

// Iterate over the results
for (const r of response.results) {
  // build the post front matter
  // convert the page to markdown
  // write it to disk
}
```

Here, we’re using 2 environment variables to store the Notion integration token and the database ID. You can find the database ID in the Notion page URL. `https://www.notion.so/<database_id>?v=<long_hash>`

You can find the importer script [here](https://github.com/aymanbagabas/aymanbagabas.github.io/blob/abd711ed3033a9416b7fedd5c3561a896ae13888/_scripts/notion-import.js).

# Periodically Import Content

Using Github Actions, we can create a workflow that runs periodically every hour to run the script and then publish the contents using Github Pages. This depends on your setup, for me, I’m hosting my website on Github Pages just because of its convenience.

The workflow runs the script, then commits all the changes back to the repository. This then triggers Github Pages to create a deployment of the website and publish the changes. Here is the [workflow](https://github.com/aymanbagabas/aymanbagabas.github.io/blob/master/.github/workflows/importer.yml) I’m currently using:

```yaml
name: Jekyll importer

on:
  push:
  schedule:
    - cron: "0 */1 * * *"

jobs:
  importer:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@master

      - uses: actions/setup-node@v2
        with:
          node-version: "17"

      - run: npm install

      - run: node _scripts/notion-import.js
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          DATABASE_ID: ${{ secrets.DATABASE_ID }}

      - uses: stefanzweifel/git-auto-commit-action@v4
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          commit_message: Update Importer posts
          branch: master
          commit_user_name: importer-bot 🤖
          commit_user_email: actions@github.com
          commit_author: importer-bot 🤖 <actions@github.com>
```

Here, I’m running the workflow every hour and using Github Secrets to store the Notion token and database ID, then use those as environment variables when running the script.

That’s it for now! Go on and write your next post!
