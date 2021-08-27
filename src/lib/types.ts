import { MessageActionRow, MessageButton, MessageOptions } from "discord.js";

export type Page = MessageOptions;

export enum ButtonPaginatorTypes {
  PREV = "PREV",
  STOP = "STOP",
  NEXT = "NEXT"
}
export type ButtonPaginatorTypesResolvable =
  | keyof typeof ButtonPaginatorTypes
  | ButtonPaginatorTypes;

export type ButtonPaginatorButton = Record<ButtonPaginatorTypes, MessageButton>;

export enum PaginatorButtonTypeOrder {
  FIRST = "FIRST",
  SECOND = "SECOND",
  THIRD = "THIRD"
}
export type ButtonPaginatorTypeOrderResolvable =
  | keyof typeof PaginatorButtonTypeOrder
  | PaginatorButtonTypeOrder;

export type ButtonPaginatorTypeOrders = Record<
  PaginatorButtonTypeOrder,
  ButtonPaginatorTypesResolvable
>;

export enum ButtonPaginatorDirection {
  NEXT = "NEXT",
  PREV = "PREV"
}
export type ButtonPaginatorDirectionResolvable =
  | keyof typeof ButtonPaginatorDirection
  | ButtonPaginatorDirection;

export interface ButtonPaginatorDeniedOptions {
  content: Page;
  ephemeral?: boolean;
}

export interface ButtonPaginatorOptions {
  pages?: Page[];
  denied?: ButtonPaginatorDeniedOptions;
  timeout?: number;
  index?: number;
  buttons?: ButtonPaginatorButton;
  // buttonOrder?: PaginatorButtonTypeOrders;
  actionRows?: MessageActionRow[];
}
