import { MessageButton, MessageOptions } from "discord.js";

export type Page = MessageOptions;

export enum PaginatorButtonTypes {
  PREV = "PREV",
  CANCEL = "CANCEL",
  NEXT = "NEXT"
}
export type PaginatorButtonTypesResolvable =
  | keyof typeof PaginatorButtonTypes
  | PaginatorButtonTypes;

export type PaginatorButton = Record<PaginatorButtonTypes, MessageButton>;

export enum PaginatorButtonTypeOrder {
  FIRST = "FIRST",
  SECOND = "SECOND",
  THIRD = "THIRD"
}
export type PaginatorButtonTypeOrderResolvable =
  | keyof typeof PaginatorButtonTypeOrder
  | PaginatorButtonTypeOrder;

export type PaginatorButtonTypeOrders = Record<
  PaginatorButtonTypeOrder,
  PaginatorButtonTypesResolvable
>;

export enum PaginatorButtonDirection {
  NEXT = "NEXT",
  PREV = "PREV"
}
export type PaginatorButtonDirectionResolvable =
  | keyof typeof PaginatorButtonDirection
  | PaginatorButtonDirection;

export interface PaginatorDeniedOptions {
  content: Page;
  ephemeral?: boolean;
}
