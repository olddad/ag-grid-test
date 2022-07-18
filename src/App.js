import './App.css';

import {useState, useEffect, useMemo, useCallback, useRef} from 'react';


import {AgGridReact} from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import 'ag-grid-enterprise';
// import { GridBodyScrollFeature } from 'ag-grid-community/dist/lib/gridBodyComp/gridBodyScrollFeature';

const SimpleComp = p => {
  const onAt = useCallback(() => window.alert('At ' + p.value));
  // console.log(p);
  if(typeof p.value != 'undefined'){
    //return <><button width='80' onClick={onAt}>{p.value}</button></>;
    return <><b style={{color:"red"}}>{p.value}</b></>
  }
}

let seq = 3;

function App() {
  const gridRef = useRef();

  const [carData, setCars] = useState([]);
  const cars = [
    {id: 0, make:'Ford', model:'Focus', price:40000},
    {id: 1, make:'Totyta', model:'Celica', price:45000},
    {id: 2, make:'BMW', model:'4 Series', price:50000}
   ];

 const [rowData, setRowData] = useState(cars);
 const [columnDefs, setColumnDef] = useState([
  {field:'make' , sortable: true, cellRenderer: SimpleComp},
  {field:'model', cellRenderer: p => <><b>{p.value}</b></>},
  {field: 'price', cellRenderer: 'agAnimateShowChangeCellRenderer'}
 ]);

 const defaultColDef = useMemo( () =>({
  sortable: true,
  filter: true,
  enableRowGroup:true,
 }), []);

 useEffect(() => {
  fetch('https://www.ag-grid.com/example-assets/row-data.json')
  .then(result => result.json())
  .then(data => {
    //setRowData(data);
    setCars(data);
    //console.log(data);

    setTimeout(() => {

      var rows = [rowData];
      for(var i=0;i<10;i++){
        console.log(data[i]);
        seq++;
        console.log("seq: ", seq);
        var car = {...data[i], id:seq+i};
        console.log('inserting car: ', car);
        
        rows ={...car, rows};
      }
      gridRef.current.api.applyTransaction({
        insert: rows
      });
      
    }, 1000);
  }); 
   setInterval(()=>{onTxUpdate();}, 1000);
 },[]);

 const TestPrice = useCallback(() => {
  onUpdate();
 });

 const onInsert = useCallback( () => {
  // console.log(carData);
  var i = Math.floor(Math.random() * carData.length);

  console.log(i);
  var car = {...carData[i], id:++seq};
  // console.log('inserting car: ', car);
  
  setRowData([car, ...rowData]);
 });

 const getRowId = useCallback( params => {
  //console.log(params);
  return params.data.id;
 });

 const onUpdate = useCallback( () => {
   var cars = rowData.map( car => {
      if (Math.random() > 0.5) { return car;}
      return {...car, price:car.price + (1000 - Math.floor(Math.random()*2000))};
    });

    setRowData(cars);
 });


 const onTxUpdate = useCallback(() => {
  const updatedRecs = [];

    gridRef.current.api.forEachNode(node =>{
      var car = node.data;
      if (Math.random() > 0.7) { 
        updatedRecs.push({...car, price:car.price + (1000 - Math.floor(Math.random()*2000))});
      }
    });

    gridRef.current.api.applyTransaction({
      update: updatedRecs
    });
});


 return (
  <div>
    <button onClick={onUpdate}>Test Price change</button>
    <button onClick={onInsert}>Insert</button>
    <br></br>
    <button onClick={onTxUpdate}>Test Tx Price Updte</button>

  <div className='ag-theme-alpine' style={{height:800}}>
    <AgGridReact 
    ref = {gridRef}
    rowData = {rowData}
    columnDefs = {columnDefs}
    rowSelection = 'multiple'
    animateRows={true}
    rowGroupPanelShow='always'
    getRowId={getRowId}
    // enableCellChangeFlash={true}
    defaultColDef = {defaultColDef}/>
  </div>
  </div>
 );
}

export default App;
