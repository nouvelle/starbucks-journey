import React from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer, PathLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import MapGL from "react-map-gl";
import LayerInfo from "./LayerInfo";
import DeckGLOverlay from "@deck.gl/react";
// Source data CSV
import sbux_stores from "./data/sbux-store-locations.json";
import trips from "./data/trips-data.json";
import logo from "./images/star.png";

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

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190]
};

// DeckGL react component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        latitude: 47.60521,
        longitude: -122.33207,
        zoom: 11,
        pitch: 30,
        maxZoom: 17
      },
      time: 0,
      hoveredItem: {},
      timelinePoints: [],
      timelineTimestamps: [],
      status: "LOADING",
      selectedPoint: {}
    };
  }

  componentDidMount() {
    this._processTrips();
    window.addEventListener("resize", this._resize);
    this._resize();
    this._animate();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._resize);
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

  _resize = () => {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  _onViewportChange = viewport => {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });
  };

  _onPointClick = ({ longitude, latitude, name }) => {
    this.setState({
      selectedPoint: { longitude, latitude, name }
    });
  };

  _renderLayers() {
    const {
      stores = sbux_stores,
      trips = [
        {
          path: this.state.timelinePoints,
          timestamps: this.state.timelineTimestamps
        }
      ],
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
        onHover: info =>
          this.setState({
            hoveredItem: info
          })
        // {
        //   const tooltip = `${d.Brand}\n${d.StoreName}\n${d.StreetAddress}`;
        //   /* Update tooltip
        //      http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
        //   */
        // }
      }),
      // new TripsLayer({
      //   id: "trips",
      //   data: trips,
      //   getPath: d => d.path,
      //   getTimestamps: d => d.timestamps,
      //   getColor: d => [48, 102, 61],
      //   opacity: 0.3,
      //   widthMinPixels: 2,
      //   rounded: true,
      //   trailLength,
      //   // currentTime: this.state.time,
      //   shadowEnabled: false
      // }),
      new PathLayer({
        id: "timeline-layer",
        data: trips,
        opacity: 0.5,
        pickable: false,
        widthScale: 2,
        widthMinPixels: 2,
        getPath: d => d.path,
        getColor: [61, 90, 254]
      })
    ];
  }

  render() {
    const {
      hoveredItem,
      viewState,
      // https://docs.mapbox.com/api/maps/#styles
      mapStyle = "mapbox://styles/mapbox/light-v10",
      theme = DEFAULT_THEME
    } = this.state;
    const timelineData = [
      {
        path: this.state.timelinePoints,
        timestamps: this.state.timelineTimestamps,
        name: "timeline",
        color: [48, 102, 61]
      }
    ];

    return (
      <MapGL
        {...this.state.viewport}
        onViewportChange={viewport => this._onViewportChange(viewport)}
        mapStyle={mapStyle}
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
      >
        <DeckGLOverlay
          viewport={this.state.viewport}
          timelineData={timelineData}
          // pointData={pointData}
          // settings={this.state.settings}
          onPointClick={this._onPointClick}
        />
        <DeckGL
          layers={this._renderLayers()}
          // effects={theme.effects}
          initialViewState={INITIAL_VIEW_STATE}
          // viewState={viewState}
          controller={true}
        >
          {/* <LayerInfo hovered={hoveredItem} /> */}
        </DeckGL>
      </MapGL>
    );
  }
}

export default App;
