# djs-button-list

Button paginator for discord.js

## Install

```bash
# npm
npm install discord.js djs-button-list

# yarn
yarn add discord.js djs-button-list
```

This package only works on discord.js@13+.

## Example

### Paginator example

```ts
import { List } from "djs-button-list";

const list = new List({
  pages: [{ content: null, embeds: [new MessageEmbed().setDescription("1")] }]
});

list.addPage({
  content: null,
  embeds: [new MessageEmbed().setDescription("2")]
});
list.run(message);
```

I will update this page soon!
