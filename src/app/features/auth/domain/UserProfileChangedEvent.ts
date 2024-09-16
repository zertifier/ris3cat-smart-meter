import {DomainEvent} from "@shared/domain/DomainEvent";

/**
 * Every time a user changes their profile data this event is emitted. A handler for this is the responsible to refresh
 * user profile data
 */
export class UserProfileChangedEvent extends DomainEvent<void> {
  public static readonly NAME = 'user.profileChanged';

  constructor() {
    super(UserProfileChangedEvent.NAME);
  }
}
