import {DomainEvent} from "./DomainEvent";

export type CallbackCancellation = () => void;
export type EventCallback = (event: DomainEvent<unknown>) => Promise<void>;

export abstract class EventBus {
  public abstract publishEvents(...event: DomainEvent<unknown>[] | any): Promise<void>;

  public abstract subscribe(eventName: string, callback: EventCallback): CallbackCancellation;
}
