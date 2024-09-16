import {DomainEvent} from "@shared/domain/DomainEvent";

/**
 * When a user logs in successfully this event is emitted. This dispatch actions like getting user information
 */
export class UserLoggedInEvent extends DomainEvent<void>{
  public static readonly NAME = 'user.loggedIn';
  constructor() {
    super(UserLoggedInEvent.NAME);
  }
}
