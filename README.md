# Facebook Global Hackathon Finals 2014
### Team Singapore
### Project: Telepathy
### Result: 3rd Prize
### License: MIT

## Introduction
We've all been in situations when we lack information about a topic while we're messaging on chat applications (WhatsApp, Messenger etc). Typically, we would minimize the chat application to search for more information, before resuming the conversation and sharing that information with the other participant(s). This often requires repeated switching between apps to acquire all the details you need for the conversation.

To enable a user to enhance their conversation with minimal effort and distraction, we built Telepathy, a smart chat assistant for the Android OS that utilizes Facebook messages. Telepathy serves the user additional information about the topic being discussed in a timely manner.

There were three parts to the project: listening to Facebook conversations/threads, understanding the conversation and guessing information the user wants to see (through natural language processing), and displaying the information to the user (through an Android app). The UI for the Android app takes inspiration from Facebook's Chat Heads feature in the Messenger app. We overlay the information on top of all other apps so that the user does not have to leave the chat application to view and interact with the information.

## Repositories
The code for the project is split into three repositories:
- [Part 1: Facebook message listener](https://www.github.com/abhilashmurthy/chat-consumer)
- [Part 2: NLP processing + suggesting generation](https://www.github.com/xumx/telepathy)
- Part 3: Android app to display results (this repo)

## Examples
### Scenario: Talking About a Movie
The participants in a conversation are talking about a movie. While they are unable to recall the name of the movie at that moment, they are able to describe certain details about it, such as the actors featuring in it or even if it is based on a book by a certain author. We aim to guess the movie they are talking about and provide additional information as the conversation progresses. So writing something like ***"I'm reading a book by Gillian Flynn. I think there's a movie based on it!"*** would trigger the following information overlay:

<img src="https://raw.githubusercontent.com/sureshs592/fb-finals-team-sg-android/master/readme%20screens/2014-11-14%2022.23.03.png" width="300px"/>

### Scenario: Movie Timings
The participants have decided on a movie that they wish to watch. Their next
step would be trying to find the show timings for the movie in and around
their area. Writing something like ***"What time would you suggest?"*** would prompt the following window:

<img src="https://raw.githubusercontent.com/sureshs592/fb-finals-team-sg-android/master/readme%20screens/2014-11-18%2005.33.02.png" width="300px"/>

### Scenario: Location
As participants decide on a location, Telepathy is able to provide previews of the location on Google Maps. Typing an address or a message such as "Shall we meet at 1 Hacker Way (Facebook HQ)" would display an interactive map:

<img src="https://raw.githubusercontent.com/sureshs592/fb-finals-team-sg-android/master/readme%20screens/2014-11-18%2005.40.46.png" width="300px"/>

### Scenario: Facebook Event Attendee
Telepathy also indexes and utilizes information from Facebook Graph. If the user met someone at an event (organised on Facebook) and was trying to recollect who that person was, writing something like "I met this guy at the hackathon yesterday. He was from Singapore" will display the following information, with an additional link to visit the Facebook profile in question:

<img src="https://raw.githubusercontent.com/sureshs592/fb-finals-team-sg-android/master/readme%20screens/2014-11-18%2005.51.20.png" width="300px"/>

## Backend: Server
In the backend, we integrated with a service called [MindMeld](https://developer.expectlabs.com/) to do most of our natural language processing. A screenshot of what was going on behind the scenes in the web server:

![server](https://raw.githubusercontent.com/sureshs592/fb-finals-team-sg-android/master/readme%20screens/server.jpg)

##Stack
- Android SDK v21
- MeteorJS
- MindMeld NLP API

##Team
- XU Mengxiang
- Suresh SUBRAMANIAM
- Alayne PANG
- Abhilash MURTHY
