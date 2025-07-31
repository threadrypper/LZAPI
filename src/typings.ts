/* Key-Any Object */
export interface IKAObject {
  [key: string]: any;
}
/* Key-String Object */
export interface IKSObject {
  [key: string]: string;
}

export enum Methods {
  GET = "get",
  POST = "post",
}

export enum Defines {
  express = "__exp__",
  app = "__app__",
}

export enum ArgType {
  Void,
  Unknown,
  String,
  Boolean,
  Number,
}

export enum FunctionType {
  Callback,
  AsyncCallback,
  Getter,
  Setter,
}
