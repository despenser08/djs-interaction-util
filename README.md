# djs-interaction-util

Discord Interaction Utils for discord.js

## Install

```bash
# npm
npm install discord.js djs-interaction-util

# yarn
yarn add discord.js djs-interaction-util
```

This package only works on discord.js@13+.

## Example

### Button Paginator example

```ts
import { ButtonPaginator } from "djs-interaction-util";

const paginator = new ButtonPaginator({
  pages: [{ embeds: [new MessageEmbed().setDescription("1")] }]
});

paginator.addPage({ embeds: [new MessageEmbed().setDescription("2")] });
paginator.run(message);
```

I will update this page soon!
