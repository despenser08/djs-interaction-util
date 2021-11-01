import {
  BaseCommandInteraction,
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
  ButtonPaginatorOptions,
  ButtonPaginatorTypeOrders
} from "../lib/types";
import { EventEmitter } from "events";

export interface ButtonPaginator {
  on(event: "start", listener: (message: Message) => void): this;

  on(event: "end", listener: (message: Message) => void): this;

  on(
    event: "actionInteraction",
    listener: (interaction: MessageComponentInteraction) => void
  ): this;
}

export class ButtonPaginator extends EventEmitter {
  public pages: Page[];
  public denied: ButtonPaginatorDeniedOptions;
  public timeout: number;
  public index: number;
  public buttons: ButtonPaginatorButton;
  public buttonOrder: ButtonPaginatorTypeOrders;
  public actionRows: MessageActionRow[];
  public buttonCollector?: InteractionCollector<MessageComponentInteraction> | null =
    null;
  public message: Message | null = null;
  public showPageIndex: boolean;

  public constructor({
    pages,
    denied,
    timeout,
    index,
    buttons,
    buttonOrder,
    actionRows,
    showPageIndex
  }: ButtonPaginatorOptions = {}) {
    super();

    this.pages = pages ?? [];
    this.denied = denied ?? {
      content: { content: "Only the requested person can control it." },
      ephemeral: true
    };
    this.timeout = timeout ?? 12e4;
    this.index = index ?? 0;
    this.buttons = buttons ?? PaginatorDefaultButton;
    this.actionRows = actionRows ?? [];
    this.buttonOrder = buttonOrder ?? {
      FIRST: "PREV",
      SECOND: "STOP",
      THIRD: "NEXT"
    };
    this.showPageIndex = showPageIndex ?? true;
  }

  public get currentPage() {
    return this.pages[this.index];
  }

  public get components() {
    const second = new MessageButton(this.buttons[this.buttonOrder.SECOND]);
    if (this.showPageIndex)
      second.setLabel(
        `${second.label} (${this.index + 1}/${this.pages.length})`
      );

    return [
      new MessageActionRow().addComponents(
        this.buttons[this.buttonOrder.FIRST],
        second,
        this.buttons[this.buttonOrder.THIRD]
      ),
      ...this.actionRows
    ];
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

  public setActionRows(actionRows: MessageActionRow[]) {
    this.actionRows = actionRows;
    return this;
  }

  public setPageIndex(show: boolean) {
    this.showPageIndex = show;
    return this;
  }

  public setOrder(order: ButtonPaginatorTypeOrders) {
    this.buttonOrder = order;
    return this;
  }

  public async run(
    reply: BaseCommandInteraction | MessageComponentInteraction,
    edit?: boolean
  ): Promise<this>;
  public async run(reply: Message, edit?: Message): Promise<this>;
  public async run(
    reply: BaseCommandInteraction | MessageComponentInteraction | Message,
    edit?: boolean | Message
  ) {
    if (!this.pages.length) throw new Error("There are no pages.");
    if (!this.buttons) throw new Error("There are no pages.");

    if (!edit) {
      if (reply instanceof Message)
        this.message = await reply.reply({
          ...this.currentPage,
          components: this.components
        });
      else {
        const fetched = await reply.reply({
          ...this.currentPage,
          components: this.components,
          fetchReply: true
        });
        this.message =
          fetched instanceof Message
            ? fetched
            : new Message(reply.client, fetched);
      }
    } else if (reply instanceof Message)
      this.message = edit
        ? await reply.edit({
            content: null,
            embeds: [],
            ...this.currentPage,
            components: this.components
          })
        : await reply.reply({
            ...this.currentPage,
            components: this.components
          });
    else {
      const fetched = edit
        ? await reply.editReply({
            content: null,
            embeds: [],
            ...this.currentPage,
            components: this.components
          })
        : await reply.reply({
            ...this.currentPage,
            components: this.components,
            fetchReply: true
          });
      this.message =
        fetched instanceof Message
          ? fetched
          : new Message(reply.client, fetched);
    }

    this.buttonCollector = this.message?.createMessageComponentCollector({
      time: this.timeout
    });

    this.buttonCollector?.on("collect", async (it) => {
      const user = reply instanceof Message ? reply.author : reply.member?.user;
      if (it.user.id === user?.id) {
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

          default:
            if (
              this.actionRows.find((row) =>
                row.components.find(
                  (component) => component.customId === it.customId
                )
              )
            )
              this.emit("actionInteraction", it);
            return;
        }

        if (this.message?.attachments.size ?? 0 > 0)
          await this.message?.removeAttachments();

        await it.editReply({
          content: null,
          embeds: [],
          ...this.currentPage,
          components: this.components
        });
      } else {
        await it.deferReply({
          ephemeral: this.denied.ephemeral ?? true
        });
        await it.editReply(this.denied.content);
      }
    });

    this.buttonCollector?.on("end", () => {
      this.message?.edit({
        components: [
          ...this.actionRows.map((row) =>
            new MessageActionRow().addComponents(
              row.components.filter(
                (component) =>
                  component.type === "BUTTON" && component.style === "LINK"
              )
            )
          )
        ]
      });
      this.buttonCollector = null;

      this.emit("end", this.message);
    });

    this.emit("start", this.message);
    return this;
  }

  public stop() {
    this.buttonCollector?.stop();
  }
}
