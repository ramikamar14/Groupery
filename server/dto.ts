/**
 * Data Transfer Objects — strip PII before sending user data to clients.
 *
 * Internal server code may access the full user record.
 * Only these sanitized shapes are sent over the API.
 */

/** Fields that are safe to expose publicly for any user. */
export function toPublicUser(user: any): any {
  if (!user) return null;
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl ?? null,
    verificationStatus: user.verificationStatus,
    rating: user.rating ?? 0,
    ratingCount: user.ratingCount ?? 0,
    userType: user.userType,
    country: user.country ?? null,
    city: user.city ?? null,
    bio: user.bio ?? null,
    language: user.language ?? null,
    reliabilityScore: user.reliabilityScore ?? 50,
    joinCount: user.joinCount ?? 0,
    completedParticipations: user.completedParticipations ?? 0,
    onboardingComplete: user.onboardingComplete ?? false,
    createdAt: user.createdAt,
  };
}

/** Sanitize a participation object — strips PII from the nested user. */
export function toPublicParticipation(participation: any): any {
  if (!participation) return null;
  return {
    ...participation,
    user: participation.user ? toPublicUser(participation.user) : undefined,
  };
}

/** Sanitize a message object — strips PII from the nested sender. */
export function toPublicMessage(message: any): any {
  if (!message) return null;
  return {
    ...message,
    sender: message.sender ? toPublicUser(message.sender) : undefined,
  };
}

/**
 * Sensitive payment coordination fields — only exposed to authenticated users
 * via the dedicated /api/listings/:id/payment-info endpoint.
 */
const PAYMENT_FIELDS = ["paymentDetails", "paymentNotes"] as const;

/** Sanitize a full listing response (creator + participants + messages).
 *  Payment detail fields (paymentDetails, paymentNotes) are stripped —
 *  they are served separately through an authenticated endpoint.
 */
export function toPublicListing(listing: any): any {
  if (!listing) return null;
  const result = { ...listing };
  for (const field of PAYMENT_FIELDS) {
    delete result[field];
  }
  result.creator = listing.creator ? toPublicUser(listing.creator) : undefined;
  result.participants = Array.isArray(listing.participants)
    ? listing.participants.map(toPublicParticipation)
    : listing.participants;
  result.messages = Array.isArray(listing.messages)
    ? listing.messages.map(toPublicMessage)
    : listing.messages;
  return result;
}

/** Full listing shape including sensitive payment fields — only for auth'd users. */
export function toParticipantListing(listing: any): any {
  if (!listing) return null;
  return {
    ...toPublicListing(listing),
    paymentDetails: listing.paymentDetails ?? null,
    paymentNotes: listing.paymentNotes ?? null,
  };
}
