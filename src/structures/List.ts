import {
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction
} from "discord.js";
import {
  ListButton,
  ListButtonDirection,
  ListButtonDirectionResolvable,
  // ListButtonTypeOrders,
  ListButtonTypesResolvable,
  ListDeniedOptions,
  Page
} from "../lib/types";

export class List {
  public pages: Page[];
  public denied: ListDeniedOptions;
  public timeout: number;
  public index: number;
  public buttons: ListButton;
  // public buttonOrder: ListButtonTypeOrders;
  public buttonCollector?: InteractionCollector<MessageComponentInteraction>;
  public message?: Message;

  public constructor({
    pages,
    denied,
    timeout,
    index,
    buttons
  }: // buttonOrder
  {
    pages?: Page[];
    denied?: ListDeniedOptions;
    timeout?: number;
    index?: number;
    buttons?: ListButton;
    // buttonOrder?: ListButtonTypeOrders;
  } = {}) {
    this.pages = pages ?? [];
    this.denied = denied ?? {
      content: { content: "Only the requested person can control it." },
      ephemeral: true
    };
    this.timeout = timeout ?? 12e4;
    this.index = index ?? 0;

    this.buttons = buttons ?? {
      PREV: new MessageButton()
        .setCustomId("prev")
        .setLabel("이전")
        .setStyle("PRIMARY"),
      CANCEL: new MessageButton()
        .setCustomId("cancel")
        .setLabel("취소")
        .setStyle("SECONDARY"),
      NEXT: new MessageButton()
        .setCustomId("next")
        .setLabel("다음")
        .setStyle("PRIMARY")
    };

    // this.buttonOrder = buttonOrder ?? {
    //   FIRST: "PREV",
    //   SECOND: "CANCEL",
    //   THIRD: "NEXT"
    // };
  }

  get currentPage() {
    return this.pages[this.index];
  }

  public setTimeout(timeout: number) {
    this.timeout = timeout;
    return this;
  }

  public setButton(
    buttonType: ListButtonTypesResolvable,
    button: MessageButton
  ) {
    this.buttons[buttonType] = button;
    return this;
  }

  public setIndex(index: number) {
    if (!this.hasPage(index))
      throw new Error(`There are no page at index ${index}.`);

    this.index = index;
    return this;
  }

  public moveIndex(direction: ListButtonDirectionResolvable) {
    if (ListButtonDirection[direction] === ListButtonDirection.PREV)
      this.setIndex(this.index > 0 ? this.index - 1 : this.pages.length - 1);
    else this.setIndex(this.index + 1 < this.pages.length ? this.index + 1 : 0);
    return this;
  }

  public hasPage(index: number) {
    return 0 <= index && index < this.pages.length;
  }

  public addPage(page: Page) {
    this.pages.push(page);
    return this;
  }

  public addPages(pages: Page[]) {
    for (const page of pages) this.addPage(page);
    return this;
  }

  public setPages(pages: Page[]) {
    this.pages = pages;
    return this;
  }

  public async run(message: Message, editMessage?: Message) {
    if (!this.pages.length) throw new Error("There are no pages.");
    if (!this.buttons) throw new Error("There are no pages.");

    const components = [
      new MessageActionRow().addComponents(
        this.buttons.PREV,
        this.buttons.CANCEL,
        this.buttons.NEXT
      )
    ];

    this.message = editMessage
      ? await editMessage.edit({ ...this.currentPage, components })
      : await message.reply({ ...this.currentPage, components });

    this.buttonCollector = this.message.createMessageComponentCollector({
      time: this.timeout
    });

    this.buttonCollector.on("collect", async (it) => {
      if (it.user.id === message.author.id) {
        await it.deferUpdate();

        switch (it.customId) {
          case this.buttons.PREV.customId:
            this.moveIndex("PREV");
            break;

          case this.buttons.CANCEL.customId:
            return this.buttonCollector?.stop();

          case this.buttons.NEXT.customId:
            this.moveIndex("NEXT");
            break;
        }

        await it.editReply(this.currentPage);
      } else {
        await it.deferReply({
          ephemeral: this.denied.ephemeral ?? true
        });
        await it.editReply(this.denied.content);
      }
    });

    this.buttonCollector.on("end", () => {
      this.message?.edit({ components: [] });
    });

    return this;
  }

  public stop() {
    this.buttonCollector?.stop();
    this.buttonCollector = undefined;
    this.message = undefined;
  }
}
