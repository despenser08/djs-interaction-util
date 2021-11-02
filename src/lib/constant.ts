import { MessageButton } from "discord.js";

export const PaginatorDefaultButton = {
  PREV: new MessageButton().setCustomId("prev").setLabel("Prev").setStyle("PRIMARY"),
  STOP: new MessageButton().setCustomId("stop").setLabel("Stop").setStyle("SECONDARY"),
  NEXT: new MessageButton().setCustomId("next").setLabel("Next").setStyle("PRIMARY")
};
