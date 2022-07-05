# iCalendar Reducer

iCalendar Reducer is a web application for selecting events from a read-only public calendar and using them to generate a new smaller calendar. It pulls from the public calendar so any changes will be reflected in the new one.

The primary use-case is to reduce the number of events shown from a Google holiday calendar. _Disclaimer:_ This app has only been tested to work with Google's public calendars which have an address in ical format.

## Why?

Currently in Canada, Google gives two choices for holiday calendars: _public only_ or _public and other holidays_. Some might find the former is missing desired holidays as it only lists the statutory ones. While the latter includes holidays for every province regardless of it's relevancy to a user's location. This application is for those who want a middle ground between the two options.

## Development

Copy .env.example to .env and make changes accordingly.

```sh
npm install
npm run setup # Run once to apply database migrations
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

If you need a development postgresql server:

```sh
npm run docker
npm run docker:stop
```
