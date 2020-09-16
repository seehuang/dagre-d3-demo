import React, { CSSProperties, ReactElement } from 'react';
import PropTypes from 'prop-types';
import * as dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import {graphlib} from 'dagre-d3'
import './dagre.scss'
import { Drawer,Button,notification} from 'antd';
interface nodes{
  [key:string]:Object
}

type edge = Array<any>

interface Props{
    fit:boolean,
    width:string,
    height:string,
    nodes:nodes,
    edges:Array<edge>,
    graph?:object,
    interactive?:boolean,
    onNodeClick?:(id:any)=> any
    onNodeMouseMove?:(id:any)=> any
}

interface actionObject{
  id:number,
  name:string
}

interface State{
    menuStyle:any,
    curId:string,
    nodes:nodes,
    edges:Array<edge>,
    actions:Array<actionObject>,
    showSelectChild:boolean,
    showSelectSibling:boolean,
    showBtnDelete:boolean,
    addChildValue:string,
    addSiblingValue:string,
    nodeChilds:Array<Array<string>>,
    drawVisible:boolean
}

class DagreD3 extends React.Component<Props,State>{
  nodeTree:React.RefObject<SVGSVGElement> = React.createRef()
  nodeTreeInner:React.RefObject<SVGGElement> = React.createRef()
  littleMenu:React.RefObject<HTMLDivElement> = React.createRef()
  g:graphlib.Graph= new dagreD3.graphlib.Graph().setGraph({rankdir:'LR'});
  renderGraph:any =  new dagreD3.render();
  svg:any = null
  inner:any = null
  body:any = null
  constructor(props:Props){
    super(props)
    this.state = {
      menuStyle:{
        top:'0px',
        left:'60px',
        display:'none'
      },
      actions:[
        {id:1,name:'step1step1step1step1'},
        {id:2,name:'step2'},
        {id:3,name:'step3'},
        {id:4,name:'step4'},
        {id:5,name:'step5'},
        {id:6,name:'step6'},
        {id:7,name:'step7'},
        {id:8,name:'step8'},
        {id:9,name:'step9'},
      ],
      curId:'0',
      showSelectChild:true,
      showSelectSibling:true,
      showBtnDelete:true,
      addChildValue:'',
      addSiblingValue:'',
      nodes:{
         1: { label: 'Begin', style: 'fill: rgb(80, 194, 138);' },
      },
      edges:[],
      nodeChilds:[],
      drawVisible:false
    }
  }

  addChildNode(e:React.ChangeEvent<HTMLSelectElement>):void{
    const action = e.target.value
    if(action == ''){
      return
    }
    const {nodes,edges,curId}  = this.state
    let newNodes = nodes
    let newEdges = edges
    const generateId = this.randam()
    newNodes[generateId] = { label: action, style: 'fill: rgb(204, 230, 255);' }
    let addEdges = [curId,generateId,{ style: 'stroke: rgb(214, 214, 214); fill: none', curve: d3.curveBasis }]
    newEdges.push(addEdges)
    this.renderDag(newNodes,newEdges);
    this.setState({
      nodes:newNodes,
      edges:newEdges,
      addChildValue:action
    })
    this.hiddenMenu()
  }

  addSiblingNode(e:React.ChangeEvent<HTMLSelectElement>):void{
    const action = e.target.value
    if(action == ''){
      return
    }
    const {nodes,edges}  = this.state
    let newNodes = nodes
    let newEdges = edges
    const generateId = this.randam()
    newNodes[generateId] = { label: action, style: 'fill: rgb(204, 230, 255);' }
    const arr = this.getPreNextNodes()
    if(arr.length === 0){
      return
    }
    let addEdgesPre = [arr[0],generateId,{ style: 'stroke: rgb(214, 214, 214); fill: none', curve: d3.curveBasis }]
    let addEdgesNext = [generateId,arr[1],{ style: 'stroke: rgb(214, 214, 214); fill: none', curve: d3.curveBasis }]
    newEdges.push(addEdgesPre,addEdgesNext)
    this.renderDag(newNodes,newEdges);
    this.setState({
      nodes:newNodes,
      edges:newEdges,
      addSiblingValue:action
    }) 
    this.hiddenMenu()
  }

  removeEdges(edges:Array<edge>):void{
    edges.map((item:edge)=>{
      this.g.removeEdge(item[0],item[1])
    })
  }

  deleteNodesAndEdges():void{
    const {edges,nodes,nodeChilds,curId}  = this.state
    let ns = nodes
    let es = edges
    let nc = nodeChilds

    let deles:Array<edge>=[]
    const allNext = edges.map((edge:edge)=>{
      return edge[1]
    })
    let counts = (arr:Array<any>, value:string) => arr.reduce((a, v) => v === value ? a + 1 : a + 0, 0);
    if(nodeChilds.length > 0 ){
      if(nodeChilds[0].length === 1 && counts(allNext,nodeChilds[0][0]) > 1){
        let ess = es.filter((item:edge)=>{
          if(item[0] ==curId||item[1]==curId){
            deles.push(item)
            return false
          }
          return true
        })
        this.g.removeNode(curId)
        delete ns[curId]
        this.setState({
          nodes:ns,
          edges:ess
        },()=>{
          //this.renderGraph(this.inner, this.g);
          this.renderDag()
          this.hiddenMenu()
        })
      }
      else{
        for(let b=es.length;b>=0;b--){
          for(let j=0;j<nc.length;j++){
            for(let k=0;k<nc[j].length;k++){
              if(es[b]){
                 if(es[b][0]==nc[j][k]||es[b][1]==nc[j][k]){
                  deles.push(es[b])
                  es.splice(b,1)
                }
              }
            }
          }
        }
    
        for(let i=0;i<nc.length;i++){
          for(let j=0;j<nc[i].length;j++){
            this.g.removeNode(nc[i][j])
            delete ns[nc[i][j]]
          }
        }
       
        
        let ess = es.filter((item:edge)=>{
          if(item[0] ==curId||item[1]==curId){
            deles.push(item)
            return false
          }
          return true
        })
        this.removeEdges(deles)
        this.g.removeNode(curId)
        delete ns[curId]
        this.setState({
          nodes:ns,
          edges:ess
        },()=>{
          //this.renderGraph(this.inner, this.g);
          this.renderDag()
          this.hiddenMenu()
        })
      }
    }
    

    if(nodeChilds.length === 0 ){
      let ess = es.filter((item:edge)=>{
        if(item[0] ==curId||item[1]==curId){
          deles.push(item)
          return false
        }
        return true
      })

      for(let i=0;i<nc.length;i++){
        for(let j=0;j<nc[i].length;j++){
          this.g.removeNode(nc[i][j])
          delete ns[nc[i][j]]
        }
      }


      this.removeEdges(deles)
      this.g.removeNode(curId)
      delete ns[curId]
      this.setState({
        nodes:ns,
        edges:ess
      },()=>{
        this.renderDag()
       // this.renderGraph(this.inner, this.g);
        this.hiddenMenu()
      })
    }
  }
  
  findChild(id:string){
    const {edges,nodeChilds}  = this.state
    let nid = id
    let childs = nodeChilds

    const allPre = edges.map((edge:edge)=>{
      return edge[0]
    })
    const allNext = edges.map((edge:edge)=>{
      return edge[1]
    })
    let arr:Array<string> = []
    if(!allPre.includes(nid)){ 
      //说明没有子节点
      // arr.push(nid)
      // childs.push(arr)
      // console.log('if',childs)
      // this.setState({
      //   nodeChilds:childs
      // })
      
    }else{
       //有子节点，则找孙子
        edges.map((edge:edge)=>{
          if(nid==edge[0]){
            arr.push(edge[1] as string)
            if(!childs.includes(arr)){
              childs.push(arr)
            }
            this.setState({
              nodeChilds:childs
            },()=>{
              this.findChild(edge[1] as string)
            })
            
          }
      })
    }
  }

  deleteNode():void{
    let {curId}  = this.state
    this.setState({
      nodeChilds:[]
    },()=>{
      this.findChild(curId)
    })
    setTimeout(()=>{
      this.deleteNodesAndEdges()
    },100)
  }

  findNodesOfDelete(id:string){
    let {edges}  = this.state
    let allPre = edges.map((item:edge)=>{
      return item[0]
    }) 
    let allNext = edges.map((item:edge)=>{
      return item[1]
    })  

    let arr = edges.map((item:edge)=>{
      if(item[0] == id){ // 如果 当前node属于pre,说明有next。把next丢进去遍历，r
        if(allPre.includes(item[1])){ //子节点是否有children
          this.findNodesOfDelete(item[1] as string)
          return item[1]
        }else{
          return item[1]
        }
      }else{
        return false
      }
    }) 

    return arr

  }

  getPreNextNodes():Array<any>{
    const {edges,curId}  = this.state
    let preArr:Array<string> = []
    let nextArr:Array<string> = []
    if(edges.length === 0){
      return []
    }
    edges.map((edge:edge)=>{
        if(edge[0] == curId){
          nextArr.push(edge[1] as string)
        }
        if(edge[1] == curId){
          preArr.push(edge[0] as string)
        }
    })
    if(preArr.length === 1 && nextArr.length === 1 ){
        return [preArr[0],nextArr[0]]
    }
    else{
        return []
    }
  }

  theChildUseByOthers():boolean{
    const {edges,nodeChilds}  = this.state
    let counts = (arr:Array<any>, value:string) => arr.reduce((a, v) => v === value ? a + 1 : a + 0, 0);
    const allNext = edges.map((edge:edge)=>{
      return edge[1]
    })
    if(nodeChilds){
      if(nodeChilds[0] && counts(allNext,nodeChilds[0][0]) > 1){
      return true

      }else{
        return false
      }
    }else{
      return false
    }
  }

  randam():string{
    return ((Math.random()*100000).toString()).substr(0,5)
  }

  componentDidMount() {
    this.svg = d3.select('svg');
    this.inner = d3.select('g');
    this.body = d3.select('#root');
    const {nodes,edges}  = this.state
    this.renderDag(nodes,edges);

    notification['info']({
      message: '对节点鼠标右键添加节点',
      description:'',
      duration:20
    });
  }

  hiddenMenu():void{
    let m = {
      top:'0',
      left:'0',
      display:'none'
    }

    this.setState({
        menuStyle:m,
        addChildValue:'',
        addSiblingValue:'',
    })
  }

  saveData():void{
    console.log(this.state.nodes)
    console.log(this.state.edges)
  }

  renderMenu():ReactElement{
    const options = this.state.actions.map((item:actionObject)=>
      <option value={item.name}>{item.name}</option>
    )
    return(
      <div ref={this.littleMenu} style={this.state.menuStyle} className="menu">
            {
              this.state.showSelectChild === true ?
              <select name="" id="" value={this.state.addChildValue} onChange={( e:React.ChangeEvent<HTMLSelectElement>)=>this.addChildNode(e)}>
                  <option value="">添加子节点</option>
                  {options}
              </select>
              
              :<span></span>
            }
            
            {
              this.state.showSelectSibling === true ?
              <select name="" id="" value={this.state.addChildValue} onChange={( e:React.ChangeEvent<HTMLSelectElement>)=>this.addSiblingNode(e)}>
                <option value="">添加兄弟</option>
                  {options}
                </select>
              :<span></span>
            }
            {
              this.state.showBtnDelete === true ?  <button className="delete-btn" onClick={()=>this.deleteNode()}>删除节点</button>:<span></span>
            }
            
        </div>
    )
  }

  drawVisibleClose(){
    this.setState({
      drawVisible:false
    })
  }

  renderDag(nodes:nodes = this.state.nodes, edges:Array<edge>=this.state.edges):void{
      let svg:any = this.svg;
      let inner:any = this.inner
      const {onNodeClick, interactive=false, fit=false, onNodeMouseMove}  = this.props
      
      for (let [id, node] of Object.entries(nodes))
          this.g.setNode(id, node as any);
      for (let edge of edges){
          this.g.setEdge(edge[0], edge[1], edge[2]); 
      }
      // set up zoom support
      if (interactive) {
          let zoom = d3.zoom().on("zoom",
              () => inner.attr("transform", d3.event.transform));
          svg.call(zoom);
      }
      // Create the renderer
      //let render = new dagreD3.render();
      // Run the renderer. This is what draws the final graph.
      this.renderGraph(inner, this.g);
      if (fit) {
          let {height: gHeight, width: gWidth} = this.g.graph();
          let transX = 100;
          let transY = 500/2 - gHeight/2-50;
          svg.attr("width", 1200);
          svg.attr("height", 500);
          inner.attr("transform", d3.zoomIdentity.translate(transX, transY))
      }
      if(onNodeClick){
        svg.selectAll('.dagre-d3 .node').on('click', (id: string) => onNodeClick(id));
      }
      if(onNodeMouseMove){
        const _this = this
        svg.selectAll('.dagre-d3 .node')
        .on('mousemove', function () {
        })
        .on('click', function (id:string) {
          _this.setState({
            drawVisible:true,
            curId:id,
          })
        })
        .on('contextmenu', function (id:string) {
          d3.event.preventDefault()
          let x:string = d3.event.clientX +'px';
          let y:string = d3.event.clientY +'px';
          if(d3.event.target.tagName){
            let m = {
              top:y,
              left:x,
            }
            
            _this.setState({
              menuStyle:m,
              curId:id,
              showBtnDelete:id == '1' ? false : true,
              nodeChilds:[]
            },()=>{
              _this.findChild(id)
              let arr = _this.getPreNextNodes()
              let flag = _this.theChildUseByOthers()
              if(flag){
                _this.setState({
                  showSelectChild:false,
                })
              }
              if(!flag){
                _this.setState({
                  showSelectChild:true,
                })
              }
              if(arr.length == 0 ){
                _this.setState({
                  showSelectSibling:false,
                })
              }
              if(arr.length == 2){
                _this.setState({
                  showSelectSibling:true
                })
              }
            })
          }
          
        })
        
      }
  }
    
  render() {
    const svgStyle = {
        border:'1px solid #ddd',
        boxShadow:'1px 1px 13px #ccc'
    }
    return (
      <div>
        <svg className='dagre-d3' ref={this.nodeTree} style={svgStyle} onClick={()=>this.hiddenMenu()}
            width={this.props.height}
            height={this.props.width}>
            <g ref={this.nodeTreeInner}/>
        </svg>
        {this.renderMenu()}
        <br/>
        <Button type="primary" onClick={()=>this.saveData()}>保存数据（浏览器控制台展示）</Button>
        <Drawer
          title={this.state.curId}
          placement="right"
          closable={false}
          onClose={()=>this.drawVisibleClose()}
          visible={this.state.drawVisible}
        >
          <p>ID：{this.state.curId}</p>
         
        </Drawer>
        
      </div>
  );
  }
}
 
export { d3 };
 
export default DagreD3;