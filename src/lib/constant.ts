import { MessageButton } from "discord.js";

export const PaginatorDefaultButton = {
  PREV: new MessageButton().setCustomId("prev").setLabel("Prev").setStyle("PRIMARY"),
  STOP: new MessageButton().setCustomId("stop").setLabel("Stop").setStyle("SECONDARY"),
  NEXT: new MessageButton().setCustomId("next").setLabel("Next").setStyle("PRIMARY")
};

export const CheckBoolDefaultButton = {
  TRUE: new MessageButton().setCustomId("true").setLabel("✔️").setStyle("SUCCESS"),
  FALSE: new MessageButton().setCustomId("false").setLabel("❌").setStyle("DANGER")
};
