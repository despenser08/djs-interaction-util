import { MessageActionRow, MessageButton, MessageOptions } from "discord.js";

export type Page = MessageOptions;

export enum ButtonPaginatorTypes {
  PREV = "PREV",
  STOP = "STOP",
  NEXT = "NEXT"
}
export type ButtonPaginatorTypesResolvable = keyof typeof ButtonPaginatorTypes | ButtonPaginatorTypes;

export type ButtonPaginatorButton = Record<ButtonPaginatorTypes, MessageButton>;

export enum ButtonPaginatorTypeOrder {
  FIRST = "FIRST",
  SECOND = "SECOND",
  THIRD = "THIRD"
}
export type ButtonPaginatorTypeOrders = Record<ButtonPaginatorTypeOrder, ButtonPaginatorTypesResolvable>;

export enum ButtonPaginatorDirection {
  NEXT = "NEXT",
  PREV = "PREV"
}
export type ButtonPaginatorDirectionResolvable = keyof typeof ButtonPaginatorDirection | ButtonPaginatorDirection;

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
  buttonOrder?: ButtonPaginatorTypeOrders;
  actionRows?: MessageActionRow[];
  showPageIndex?: boolean;
}

export enum ButtonCheckBoolTypes {
  TRUE = "TRUE",
  FALSE = "FALSE"
}
export type ButtonCheckBoolTypesResolvable = keyof typeof ButtonCheckBoolTypes | ButtonCheckBoolTypes;

export type ButtonCheckBoolButton = Record<ButtonCheckBoolTypes, MessageButton>;

export interface ButtonCheckBoolDeniedOptions {
  content: Page;
  ephemeral?: boolean;
}

export interface ButtonCheckBoolOptions {
  page: Page;
  denied?: ButtonCheckBoolDeniedOptions;
  timeout?: number;
  buttons?: ButtonCheckBoolButton;
  actionRows?: MessageActionRow[];
}
