import React from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import MapGL from "react-map-gl";
import DeckGLOverlay from "@deck.gl/react";
// Source data CSV
import sbux_stores from "./data/seattle-locations";
import trips from "./data/trips-data.json";
import logo from "./images/star.png";

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Viewport initial setting (SEATTLE ver)
const INITIAL_VIEW_STATE = {
  latitude: 47.60521,
  longitude: -122.33207,
  zoom: 11.9,
  pitch: 0,
  bearing: 0
};

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 36, height: 36, mask: true }
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
        zoom: 12,
        pitch: 0,
        maxZoom: 17
      },
      time: 0,
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
        const startTime = new Date("2019/2/16");
        const startTimestamp = startTime.getTime();
        const elapsed = Number(curr.timestampMs) - startTimestamp;
        // ミリ秒を分に変換(端数切捨て)
        var min = Math.floor(elapsed / (1000 * 60));
        // console.log("elapsed", elapsed);
        // console.log("min", min);

        accu.push(min);
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
      loopLength = 1000, // unit corresponds to the timestamp in source data
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

  _updateTooltipStop = ({ x, y, object }) => {
    const tooltip = document.getElementById("tooltip");
    // console.log("object : ", object);
    if (object && object.name) {
      console.log(object.name);
      tooltip.style.visibility = "visible";
      tooltip.style.top = y + "px";
      tooltip.style.left = x + "px";
      tooltip.style.zIndex = 2;
      tooltip.innerHTML = "<p>" + object.name + "</p>";
    } else {
      console.log("click");
      tooltip.style.visibility = "hidden";
      tooltip.style.zIndex = 0;
      tooltip.innerHTML = "";
    }
  };
  // _updateTimeLine = ({ x, y, object }) => {
  //   const timeline = document.getElementById("timeline");
  //   if (object && object.name) {
  //     console.log(object.name);
  //     tooltip.style.visibility = "visible";
  //     tooltip.style.top = y + "px";
  //     tooltip.style.left = x + "px";
  //     tooltip.style.zIndex = 2;
  //     tooltip.innerHTML = "<p>" + object.name + "</p>";
  //   } else {
  //     console.log("click");
  //     tooltip.style.visibility = "hidden";
  //     tooltip.style.zIndex = 0;
  //     tooltip.innerHTML = "";
  //   }
  // };
  _renderLayers() {
    const {
      stores = sbux_stores,
      trips = [
        {
          path: this.state.timelinePoints,
          timestamps: this.state.timelineTimestamps
        }
      ],
      trailLength = 600,
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
        getColor: d => [48, 102, 61],
        // onHover: this._updateTooltipStop,
        onClick: this._updateTooltipStop
      }),
      new TripsLayer({
        id: "trips",
        data: trips,
        getPath: d => d.path,
        getTimestamps: d => d.timestamps,
        getColor: d => [84, 169, 99],
        opacity: 0.8,
        widthMinPixels: 5,
        rounded: true,
        trailLength,
        currentTime: this.state.time,
        shadowEnabled: false
      })
    ];
  }

  render() {
    const {
      mapStyle = "mapbox://styles/mapbox/light-v10" // https://docs.mapbox.com/api/maps/#styles
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
          onPointClick={this._onPointClick}
        />
        <DeckGL
          layers={this._renderLayers()}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
        ></DeckGL>
      </MapGL>
    );
  }
}

export default App;
