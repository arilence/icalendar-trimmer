# iCalendar Trimmer

iCalendar Trimmer is a web application for trimming events from a read-only public iCalendar. Select the desired events and this will generate a new smaller ics calendar to be imported elsewhere.

The primary use-case is to reduce the number of events shown from a Google holiday calendar. _Disclaimer:_ This app has only been tested to work with Google's public calendars which have an address in ical format.

## Development

- Copy `.env.example` to `.env` and make changes accordingly.

- Start the app in development mode:

```sh
npm install
npm run setup # Run once to apply database migrations
npm run dev
```

- Optionally, if you need a development postgresql server:

```sh
npm run docker
npm run docker:stop
```
