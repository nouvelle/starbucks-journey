import React from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import { StaticMap } from "react-map-gl";
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {PhongMaterial} from '@luma.gl/core';
import LayerInfo from './LayerInfo';
// Source data CSV
import sbux_stores from "./data/sbux-store-locations.json";
import trips from "./data/trips-data.json";
import logo from "./images/star.png";

console.log(sbux_stores);

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Viewport initial setting (SEATTLE ver)
const INITIAL_VIEW_STATE = {
  latitude: 47.60521,
  longitude: -122.33207,
  zoom: 11.9,
  pitch: 20,
  bearing: 0
};

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 36, height: 36, mask: true }
};
// https://deck.gl/index.html#/documentation/deckgl-api-reference/lights/ambient-light
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

// https://deck.gl/index.html#/documentation/deckgl-api-reference/lights/point-light
const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

// https://deck.gl/index.html#/documentation/deckgl-api-reference/effects/lighting-effect
const lightingEffect = new LightingEffect({ambientLight, pointLight});

// https://luma.gl/docs/api-reference/core/materials/phong-material
const material = new PhongMaterial({
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
});

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};

// DeckGL react component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      time: 0,
      hoveredItem: {},
      timelinePoints: [],
      timelineTimestamps: [],
      status: "LOADING",
    };
  }

  componentDidMount() {
    this._processTrips();
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _processTrips = () => {
    if (trips) {
      this.setState({ status: "LOADED" });
      const timelinePoints = trips.locations.reduce((accu, curr) => {
        // divide by 10000000 to convert E7 lat/long into normal lat/long
        accu.push([curr.longitudeE7 / 10000000, curr.latitudeE7 / 10000000]);
        return accu;
      }, []);
      const timelineTimestamps = trips.locations.reduce((accu, curr) => {
        accu.push(curr.timestampMs);
        return accu;
      }, []);
      this.setState({
        timelinePoints,
        timelineTimestamps,
        status: "READY"
      });
    }
  };
  
  _animate() {
    const {
      loopLength = 1800, // unit corresponds to the timestamp in source data
      animationSpeed = 30 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed; // 60

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength // 1 ~ 1800
    });
    // console.log(this.state.time);
    // requestAnimationFrame: ブラウザの描画タイミング毎に実行
    this._animationFrame = window.requestAnimationFrame(
      this._animate.bind(this)
    );
  }

  _renderLayers() {
    const {
      stores = sbux_stores,
      trips = [{
        path: this.state.timelinePoints,
        timestamps: this.state.timelineTimestamps,
      }],
      trailLength = 180,
      theme = DEFAULT_THEME,
      image = logo
    } = this.props;

    return [
      new IconLayer({
        id: "stores",
        data: stores,
        pickable: true,
        iconAtlas: image,
        iconMapping: ICON_MAPPING,
        getIcon: d => "marker",
        sizeScale: 15,
        getPosition: d => [d.Longitude, d.Latitude],
        getSize: d => 2,
        // sizeScale: 10,
        getColor: d => [48, 102, 61],
        onHover: info => this.setState({
          hoveredItem: info
        })
        // {
        //   const tooltip = `${d.Brand}\n${d.StoreName}\n${d.StreetAddress}`;
        //   /* Update tooltip
        //      http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
        //   */
        // }
      }),
      new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.path,
        getTimestamps: d => d.timestamps,
        getColor: d => [48, 102, 61],
        opacity: 0.3,
        widthMinPixels: 2,
        rounded: true,
        trailLength,
        // currentTime: this.state.time,
        shadowEnabled: false
      }),
    ];
  }

  // _renderTooltip() {
  //   console.log(this.state);
  //   const {hoveredObject, pointerX, pointerY} = this.state || {};
    // return hoveredObject && (
    //   <div style={{position: 'absolute', zIndex: 1, pointerEvents: 'none', left: pointerX + 10, top: pointerY + 10}}>
    //     { hoveredObject.StoreName }
    //   </div>
    // );
  // }
  render() {
    const { 
      hoveredItem,
      viewState,
      // https://docs.mapbox.com/api/maps/#styles
      mapStyle = 'mapbox://styles/mapbox/light-v10',
      theme = DEFAULT_THEME 
    } = this.state;

    return (
      <DeckGL
        layers={this._renderLayers()}
        // effects={theme.effects}
        initialViewState={INITIAL_VIEW_STATE}
        // viewState={viewState}
        controller={true}
      >
        <LayerInfo hovered={hoveredItem} />
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          />
      </DeckGL>
    );
  }
}

export default App;
