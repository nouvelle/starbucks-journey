import React from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer } from "@deck.gl/layers";
// import { TripsLayer } from "@deck.gl/geo-layers";
import { StaticMap } from "react-map-gl";
import LayerInfo from './LayerInfo';
// Source data CSV
import sbux_stores from "./sbux-store-locations.json";
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

// DeckGL react component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      time: 0,
      hoveredItem: {},
    };
  }

  // componentDidMount() {
  //   this._animate();
  // }

  // componentWillUnmount() {
  //   if (this._animationFrame) {
  //     window.cancelAnimationFrame(this._animationFrame);
  //   }
  // }

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
    console.log(this.state.time);
    // requestAnimationFrame: ブラウザの描画タイミング毎に実行
    this._animationFrame = window.requestAnimationFrame(
      this._animate.bind(this)
    );
  }

  _renderLayers() {
    const {
      stores = sbux_stores,
      // trips = DATA_SOURCE.TRIPS
      // trailLength = 180,
      // theme = DEFAULT_THEME
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
      })
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
    const { hoveredItem } = this.state;
    return (
      <DeckGL viewState={INITIAL_VIEW_STATE} controller={true} layers={this._renderLayers()}>
        <LayerInfo hovered={hoveredItem} />
        {/* https://docs.mapbox.com/api/maps/#styles */}
        <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle="mapbox://styles/mapbox/light-v10" />
      </DeckGL>
    );
  }
}

export default App;
