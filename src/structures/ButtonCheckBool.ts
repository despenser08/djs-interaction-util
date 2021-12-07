import { BaseCommandInteraction, InteractionCollector, Message, MessageActionRow, MessageButton, MessageComponentInteraction } from "discord.js";
import { CheckBoolDefaultButton } from "../lib/constant";
import { Page, ButtonCheckBoolDeniedOptions, ButtonCheckBoolButton, ButtonCheckBoolOptions, ButtonCheckBoolTypesResolvable } from "../lib/types";
import { EventEmitter } from "events";

export interface ButtonCheckBool {
  on(event: "start", listener: (message: Message) => void): this;

  on(event: "end", listener: (message: Message, result: boolean | null) => void): this;

  on(event: "actionInteraction", listener: (interaction: MessageComponentInteraction) => void): this;
}

export class ButtonCheckBool extends EventEmitter {
  public page: Page;
  public denied: ButtonCheckBoolDeniedOptions;
  public timeout: number;
  public buttons: ButtonCheckBoolButton;
  public actionRows: MessageActionRow[];
  public buttonCollector?: InteractionCollector<MessageComponentInteraction> | null = null;
  public message: Message | null = null;

  public constructor({ page, denied, timeout, buttons, actionRows }: ButtonCheckBoolOptions) {
    super();

    this.page = page;
    this.denied = denied
      ? { ...denied, ephemeral: denied.ephemeral ?? true }
      : {
          content: { content: "Only the requested person can control it." },
          ephemeral: true
        };
    this.timeout = timeout ?? 12e4;
    this.buttons = buttons ?? CheckBoolDefaultButton;
    this.actionRows = actionRows ?? [];
  }

  public setTimeout(timeout: number) {
    this.timeout = timeout;
    return this;
  }

  public setButton(buttonType: ButtonCheckBoolTypesResolvable, button: MessageButton) {
    this.buttons[buttonType] = button;
    return this;
  }

  public setButtons(buttons: ButtonCheckBoolButton) {
    this.buttons = buttons;
    return this;
  }

  public setPage(page: Page) {
    this.page = page;
    return this;
  }

  public setDenied(denied: ButtonCheckBoolDeniedOptions) {
    this.denied = { ...denied, ephemeral: denied.ephemeral ?? true };
    return this;
  }

  public setActionRows(actionRows: MessageActionRow[]) {
    this.actionRows = actionRows;
    return this;
  }

  public async run(reply: BaseCommandInteraction | MessageComponentInteraction, edit?: boolean): Promise<boolean | null>;
  public async run(reply: Message, edit?: Message): Promise<boolean | null>;
  public async run(reply: BaseCommandInteraction | MessageComponentInteraction | Message, edit?: boolean | Message) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<boolean | null>(async (resolve, reject) => {
      if (!this.buttons) return reject(new Error("There are no pages."));
      const components = [new MessageActionRow().addComponents(...this.buttons), ...this.actionRows];

      if (!edit) {
        if (reply instanceof Message)
          this.message = await reply.reply({
            ...this.page,
            components
          });
        else {
          const fetched = await reply.reply({
            ...this.page,
            components,
            fetchReply: true
          });
          this.message = fetched instanceof Message ? fetched : new Message(reply.client, fetched);
        }
      } else if (reply instanceof Message) {
        if (edit instanceof Message)
          this.message = edit
            ? await edit.edit({
                content: null,
                embeds: [],
                ...this.page,
                components
              })
            : await reply.reply({
                ...this.page,
                components
              });
        else return reject(new TypeError("You must provide a message to edit."));
      } else {
        const fetched = edit
          ? await reply.editReply({
              content: null,
              embeds: [],
              ...this.page,
              components
            })
          : await reply.reply({
              ...this.page,
              components,
              fetchReply: true
            });
        this.message = fetched instanceof Message ? fetched : new Message(reply.client, fetched);
      }

      this.buttonCollector = this.message?.createMessageComponentCollector({ time: this.timeout });

      this.buttonCollector?.on("collect", async (it) => {
        const user = reply instanceof Message ? reply.author : reply.member?.user;
        if (it.user.id === user?.id) {
          await it.deferUpdate();

          switch (it.customId) {
            case this.buttons.TRUE.customId:
              return this.buttonCollector?.stop("true");

            case this.buttons.FALSE.customId:
              return this.buttonCollector?.stop("false");

            default:
              if (this.actionRows.find((row) => row.components.find((component) => component.customId === it.customId)))
                this.emit("actionInteraction", it);
              return;
          }
        } else {
          await it.deferReply({ ephemeral: this.denied.ephemeral });
          await it.editReply(this.denied.content);
        }
      });

      this.buttonCollector?.on("end", (_, reason) => {
        this.message?.edit({
          components: [
            ...this.actionRows.map((row) =>
              new MessageActionRow().addComponents(row.components.filter((component) => component.type === "BUTTON" && component.style === "LINK"))
            )
          ]
        });
        this.buttonCollector = null;

        let result: boolean | null = null;
        if (reason === "true") result = true;
        else if (reason === "false") result = false;

        this.emit("end", this.message, result);
        resolve(result);
      });

      this.emit("start", this.message);
    });
  }

  public stop() {
    this.buttonCollector?.stop();
  }
}
