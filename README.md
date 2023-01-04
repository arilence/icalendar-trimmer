# iCalendar Trimmer

iCalendar Trimmer is a web application for trimming events from a read-only public iCalendar. Select the desired events and this will generate a new smaller ics calendar to be imported elsewhere.

The primary use-case is to reduce the number of events shown from a Google holiday calendar. _Disclaimer:_ This app has only been tested to work with Google's public calendars which have an address in ical format.

## Development

This repository is setup to use vscode's [Dev Containers](https://code.visualstudio.com/docs/remote/containers)

1. Clone this repository and open the folder in vscode.
2. Copy `.env.example` to `.env` and make changes accordingly.
3. Using vscode's command palette _(F1)_, select: **Dev Containers: Reopen in Container**.
4. Wait for the container to finish building.
5. Open a new terminal _(Ctrl + Shift + \`)_ and run `npm run dev`.
