# Drop "pending attendees" warning Alert (frontend)

## User Story

As an event organizer reviewing the attendance screen, I should not see a
"there are still pending attendees" warning, because the platform now assumes
everyone who signed up will attend. The warning was meaningful only while
`"pending"` was the default attendance status; it now alarms organizers about
a state that no new sign-up will produce.

## Why this matters

This change is the client-side counterpart of the server flipping the
`Attendee.attendance` default from `"pending"` to `"show"`. With the new
default, every freshly-joined volunteer is already considered attending, so
the warning Alert in `AttendeeAttendance.jsx` would either never fire (for new
events) or fire only on legacy records the organizer already knows about. In
both cases it adds visual noise without adding signal.

## Acceptance Scenarios

### Scenario 1 — No warning when nobody is pending

Given a list of attendees where every `attendance` value is `"show"`,
  `"no-show"`, or `"excused"`,
When `AttendeeAttendance` renders the list,
Then no warning Alert about pending attendees is shown.

### Scenario 2 — No warning even when legacy "pending" records exist

Given a list of attendees that includes one record with
  `attendance: "pending"` (a legacy record from before the default flip),
When `AttendeeAttendance` renders the list,
Then no warning Alert about pending attendees is shown.

### Scenario 3 — Per-attendee dropdown is unchanged

Given the attendance management screen,
When an organizer opens an attendee's status dropdown,
Then the four options (Pendiente, Si asistió, No asistió, Excusado) are
  still present and selectable, so legacy records can be cleaned up
  manually if needed.

## Functional Requirements

- **FR-1**: `AttendeeAttendance` MUST NOT render any element whose role is to
  warn about pending attendees.
- **FR-2**: `AttendeeAttendanceCard` MUST keep its current four-option
  dropdown unchanged in this iteration.

## Out of scope

- A redesigned attendance UI centered on toggling no-shows. That is a
  follow-up iteration; this change is the minimum needed to stop alarming
  organizers about a non-issue.
- Removing `"pending"` from the dropdown or from the colour map.
