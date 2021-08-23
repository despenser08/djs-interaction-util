import { MessageButton, MessageOptions, MessagePayload } from "discord.js";

export type Page = string | MessagePayload | MessageOptions;

export enum ListButtonTypes {
  PREV = "PREV",
  CANCEL = "CANCEL",
  NEXT = "NEXT"
}
export type ListButtonTypesResolvable =
  | keyof typeof ListButtonTypes
  | ListButtonTypes;

export type ListButton = Record<ListButtonTypes, MessageButton>;

export enum ListButtonTypeOrder {
  FIRST = "FIRST",
  SECOND = "SECOND",
  THIRD = "THIRD"
}
export type ListButtonTypeOrderResolvable =
  | keyof typeof ListButtonTypeOrder
  | ListButtonTypeOrder;

export type ListButtonTypeOrders = Record<
  ListButtonTypeOrder,
  ListButtonTypesResolvable
>;

export enum ListButtonDirection {
  NEXT = "NEXT",
  PREV = "PREV"
}
export type ListButtonDirectionResolvable =
  | keyof typeof ListButtonDirection
  | ListButtonDirection;

export interface ListDeniedOptions {
  content: Page;
  ephemeral?: boolean;
}
