import {
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction
} from "discord.js";
import { PaginatorDefaultButton } from "../lib/constant";
import {
  ButtonPaginatorButton,
  ButtonPaginatorDirection,
  ButtonPaginatorDirectionResolvable,
  ButtonPaginatorTypesResolvable,
  ButtonPaginatorDeniedOptions,
  Page,
  ButtonPaginatorOptions
  // PaginatorButtonTypeOrders
} from "../lib/types";

export class ButtonPaginator {
  public pages: Page[];
  public denied: ButtonPaginatorDeniedOptions;
  public timeout: number;
  public index: number;
  public buttons: ButtonPaginatorButton;
  // public buttonOrder: PaginatorButtonTypeOrders;
  public actionRows: MessageActionRow[];
  public buttonCollector?: InteractionCollector<MessageComponentInteraction>;
  public message?: Message;

  public constructor({
    pages,
    denied,
    timeout,
    index,
    buttons /* ,
    buttonOrder */,
    actionRows
  }: ButtonPaginatorOptions = {}) {
    this.pages = pages ?? [];
    this.denied = denied ?? {
      content: { content: "Only the requested person can control it." },
      ephemeral: true
    };
    this.timeout = timeout ?? 12e4;
    this.index = index ?? 0;
    this.buttons = buttons ?? PaginatorDefaultButton;
    this.actionRows = actionRows ?? [];
    /* this.buttonOrder = buttonOrder ?? {
      FIRST: "PREV",
      SECOND: "STOP",
      THIRD: "NEXT"
    }; */
  }

  public get currentPage() {
    return this.pages[this.index];
  }

  public setTimeout(timeout: number) {
    this.timeout = timeout;
    return this;
  }

  public setButton(
    buttonType: ButtonPaginatorTypesResolvable,
    button: MessageButton
  ) {
    this.buttons[buttonType] = button;
    return this;
  }

  public setButtons(buttons: ButtonPaginatorButton) {
    this.buttons = buttons;
    return this;
  }

  public setIndex(index: number) {
    if (!this.hasPage(index))
      throw new Error(`There are no page at index ${index}.`);

    this.index = index;
    return this;
  }

  public moveIndex(direction: ButtonPaginatorDirectionResolvable) {
    if (ButtonPaginatorDirection[direction] === ButtonPaginatorDirection.PREV)
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

  public setDenied(denied: ButtonPaginatorDeniedOptions) {
    this.denied = denied;
    return this;
  }

  public async run(message: Message, editMessage?: Message) {
    if (!this.pages.length) throw new Error("There are no pages.");
    if (!this.buttons) throw new Error("There are no pages.");

    const components = [
      new MessageActionRow().addComponents(
        this.buttons.PREV,
        this.buttons.STOP,
        this.buttons.NEXT
      ),
      ...this.actionRows
    ];

    this.message = editMessage
      ? await editMessage.edit({
          content: null,
          embeds: null,
          ...this.currentPage,
          components
        })
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

          case this.buttons.STOP.customId:
            return this.buttonCollector?.stop();

          case this.buttons.NEXT.customId:
            this.moveIndex("NEXT");
            break;
        }

        await this.message?.removeAttachments();
        await it.editReply({ content: null, embeds: [], ...this.currentPage });
      } else {
        await it.deferReply({
          ephemeral: this.denied.ephemeral ?? true
        });
        await it.editReply(this.denied.content);
      }
    });

    this.buttonCollector.on("end", () => {
      this.message?.edit({ components: [...this.actionRows] });
      this.message = undefined;
      this.buttonCollector = undefined;
    });

    return this;
  }

  public stop() {
    this.buttonCollector?.stop();
  }
}
