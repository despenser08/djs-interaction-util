# djs-button-list

Button paginator for discord.js

## Install

```bash
# npm
npm install djs-button-list

# yarn
yarn add djs-button-list
```

## Example

```ts
import { List } from "djs-button-list";

const list = new List({
  pages: [{ embeds: [new MessageEmbed().setDescription("1")] }]
});

list.addPage({ embeds: [new MessageEmbed().setDescription("2")] });
list.run(message);
```

I will update this page soon!
