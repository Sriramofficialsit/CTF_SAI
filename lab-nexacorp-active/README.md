# NexaCorp Recon Console — Active Recon Lab

## Scenario
You've moved from passive research into active reconnaissance. This console
is your toolkit for probing the target host directly: a built-in port
scanner and a banner grabber. Everything here talks only to a simulated host
— nothing leaves this lab.

## Setup
```
npm install
npm start
```
Then open http://localhost:3002

## Rules
- Scope is limited to the single assigned target shown on the Target tab.
- Use the built-in Port Scanner and Banner Grabber tools only.

## Goal
Find every open port on the target, read each service's banner carefully,
follow where they lead, and find the flag. Submission is handled by the platform.

## Tools available
- **Port Scanner** — scan a common-ports preset or a custom port range
- **Banner Grabber** — connect to a specific port and read its response
