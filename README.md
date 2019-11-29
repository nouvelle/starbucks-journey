# My Starbucks journey in Seattle ☕

You can check out the app on [Heroku](https://my-deckgl.herokuapp.com/)!

![image](https://user-images.githubusercontent.com/5979966/69880385-22594600-130d-11ea-9c1c-6d57358bb4cb.gif)

1. [About](#About)
1. [Using Data](#Using%20Data)
1. [Using Layer of Deck.gl](#Using%20Layer%20of%20Deck.gl)
1. [Development](#Development)
1. [Technology used](#Technology%20used)
1. [Contributing](#Contributing)
1. [License](#License)

# About

This is my Starbucks journey in Seattle using [Deck.gl](https://github.com/uber/deck.gl) made by UBER.

# Using Data

I used the following data.

1. Traceability of my trip to Seattle using Google Map timeline
2. Starbucks store location data from [Kaggle](https://www.kaggle.com/starbucks/store-locations)

# Using Layer of Deck.gl

1. Trips Layer (for traceability of my trip)
2. Icon Layer (for Starbucks store location)

# Development

Follow this guide to set up your environment etc.

To clone and run this application, you'll need Git and Node.js (which comes with yarn) installed on your computer.  
From your command line:

**Downloading and installing steps**

1. Clone this repository

```bash
$ git clone https://github.com/nouvelle/starbucks-journey
```

2. Go into the repository

```bash
$ cd starbucks-journey
```

3. Install dependencies

```bash
$ yarn
```

4. Run the app

```bash
$ yarn start
```

# Technology used

This software uses the following open source packages:

- JavaScript
- React
- Node.js
- express
- [Deck.gl](https://deck.gl/)
- [Mapbox](https://www.mapbox.com/)

* About Mapbox Tokens
  To load the map styles and tiles from Mapbox's data service, you will need to register on their website in order to retrieve an [access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/) required by the map component, which will be used to identify you and start serving up map tiles. The service will be free until a certain level of traffic is exceeded.

  Please set environment variable _REACT_APP_MAPBOX_TOKEN_

# Contributing

Pull requests are welcome!! 😊

# License

[MIT](https://choosealicense.com/licenses/mit/)
