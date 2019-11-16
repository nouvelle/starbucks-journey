import React from "react";

// DeckGL react component
class LayerInfo extends React.Component {
  render(){
    const { hovered } = this.props;
    // console.log("hovered", hovered);
    
    return (
      <div>popup!!!</div>
      // <div>{ hovered.object }</div>
      // <div style={{position: 'absolute', zIndex: 1, pointerEvents: 'none', left: hovered.x + 10, top: hovered.y + 10}}>
      //       { hoveredObject.StoreName } </div>
    );
  }
}

export default LayerInfo;
