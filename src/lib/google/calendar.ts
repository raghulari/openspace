// ─── Google Calendar Helpers ────────────────────────────────
// Handles event operations on Google Calendar.

const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

export interface CalendarEventAttendee {
  email: string;
  displayName?: string;
  responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
}

export interface CalendarEventDateTime {
  dateTime?: string; // RFC 3339 (e.g., "2026-06-01T10:00:00+05:30")
  date?: string; // "2026-06-01" for all-day events
  timeZone?: string;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: CalendarEventDateTime;
  end: CalendarEventDateTime;
  attendees?: CalendarEventAttendee[];
  htmlLink?: string;
  status?: string;
  created?: string;
  updated?: string;
  conferenceData?: Record<string, unknown>;
}

export interface CalendarEventList {
  items: CalendarEvent[];
  nextPageToken?: string;
}

export interface CreateEventOptions {
  calendarId?: string;
  event: Omit<CalendarEvent, "id" | "htmlLink" | "status" | "created" | "updated">;
  sendUpdates?: "all" | "externalOnly" | "none";
}

export interface ListEventsOptions {
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  pageToken?: string;
  singleEvents?: boolean;
  orderBy?: "startTime" | "updated";
}

/**
 * Create a new event on Google Calendar.
 */
export async function createEvent(
  accessToken: string,
  options: CreateEventOptions
): Promise<CalendarEvent> {
  // TODO: Implement event creation via Calendar API
  const calendarId = options.calendarId ?? "primary";
  const params = new URLSearchParams({
    sendUpdates: options.sendUpdates ?? "none",
  });

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${calendarId}/events?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options.event),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.statusText}`);
  }

  return response.json();
}

/**
 * List events from Google Calendar.
 */
export async function listEvents(
  accessToken: string,
  options: ListEventsOptions = {}
): Promise<CalendarEventList> {
  // TODO: Implement event listing via Calendar API
  const calendarId = options.calendarId ?? "primary";
  const params = new URLSearchParams({
    maxResults: String(options.maxResults ?? 50),
    singleEvents: String(options.singleEvents ?? true),
    orderBy: options.orderBy ?? "startTime",
  });

  if (options.timeMin) params.set("timeMin", options.timeMin);
  if (options.timeMax) params.set("timeMax", options.timeMax);
  if (options.pageToken) params.set("pageToken", options.pageToken);

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${calendarId}/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list events: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update an existing event on Google Calendar.
 */
export async function updateEvent(
  accessToken: string,
  eventId: string,
  event: Partial<CalendarEvent>,
  calendarId: string = "primary"
): Promise<CalendarEvent> {
  // TODO: Implement event update via Calendar API
  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${calendarId}/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update event: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete an event from Google Calendar.
 */
export async function deleteEvent(
  accessToken: string,
  eventId: string,
  calendarId: string = "primary"
): Promise<void> {
  // TODO: Implement event deletion via Calendar API
  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${calendarId}/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.statusText}`);
  }
}
