import React from 'react';
import logo from './logo.svg';
import './App.css';
import DagreD3,{d3} from './dagre'
import 'antd/dist/antd.css'; 

class App extends React.Component{

    clickNode(id:any){
    }

    onNodeMouseMove(id:any){
    }

    renderSelect(){
      return(
        <select>
          <option value ="volvo">Volvo</option><option value ="saab">Saab</option><option value="opel">Opel</option><option value="audi">Audi</option>
        </select>
      )
    }

    render(){
      const nodes = {
        0: { label: 'ReactComponent', style: 'fill: rgb(80, 194, 138);' },
        1: { label: 'props', style: 'fill: rgb(204, 230, 255);' },
        2: { label: 'context', style: 'fill: rgb(204, 230, 255);' },
        3: { label: 'end', style: 'fill: rgb(204, 230, 255);' },
        4: { label: 'end', style: 'fill: rgb(204, 230, 255);' },
        2235: { label:"<button>Button</button>",labelType:"html",style: 'fill: rgb(204, 230, 255);'}
      };
      
      const edges = [
        [0, 1, { style: 'stroke: rgb(214, 214, 214); fill: none', curve: d3.curveBasis }],
        [0, 2, { style: 'stroke: rgb(214, 214, 214); fill: none', curve: d3.curveBasis }],
        [0, 3, { style: 'stroke: rgb(214, 214, 214); fill: none', curve: d3.curveBasis }],
        [1, 4, { style: 'stroke: rgb(214, 214, 214); fill: none', curve: d3.curveBasis }],
        [2, 4, { style: 'stroke: rgb(214, 214, 214); fill: none', curve: d3.curveBasis }],
      ]
      return ( 
        <div className="App">
          <DagreD3
              fit={true}
              nodes={nodes}
              edges={edges}
              width="500px"
              height="500px"
              onNodeClick ={(id)=>this.clickNode(id)}
              onNodeMouseMove={(id)=>this.onNodeMouseMove(id)}
          ></DagreD3>
        </div>
      );
    }
}


export default App;
