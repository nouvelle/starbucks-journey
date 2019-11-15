// only line without map component using React
import React from 'react';
import DeckGL from '@deck.gl/react';
import {LineLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Viewport setting
const viewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
}

// Data to be used by the LineLayer
const data = [{sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}];

// DeckGL react component
class App extends React.Component {
  render() {
    const layers = [new LineLayer({id: 'line-layer', data})];
    return (
      <DeckGL viewState={viewState} controller={true} layers={layers} >
        <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
      </DeckGL>
    );
  }
}

export default App;
