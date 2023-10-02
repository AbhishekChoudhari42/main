"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import rough from "roughjs";
import { isIntersecting } from "@/utils/collision";

const generator = rough.generator();

const generateElement = (x1, y1, x2, y2, tool) => {

    let element;

    switch (tool) {
        case "line":
            element = generator.line(x1, y1, x2, y2);
            break;
        case "rectangle":
            element = generator.rectangle(x1, y1, x2 - x1, y2 - y1, { roughness: 0.5, fill: 'red' });
            break;
        case "ellipse":
            element = generator.ellipse(
                Math.round((x1 + x2) / 2),
                Math.round((y1 + y2) / 2),
                Math.round(x2 - x1),
                Math.round(y2 - y1),
                { roughness: 0.5, fill: 'blue' }
            );
            break;
        default:
            break;
    }
    return { x1, y1, x2, y2, element };
};

const minmax = (x1,y1,x2,y2) => {
    return {
        minX: Math.min(x1,x2),
        minY: Math.min(y1,y2),
        maxX: Math.max(x1,x2),
        maxY: Math.max(y1,y2),
    }
}

const Canvas = () => {

    //for testing
    const noOfElements = 3
    const [elements, setElements] = useState(new Array(noOfElements).fill(0).map(()=>generateElement(Math.random()*500 + 20,Math.random()*500 + 20,Math.random()*500 + 20,Math.random()*500 + 20,"rectangle")));

    // const [elements, setElements] = useState([]);
    const [drawing, setDrawing] = useState(false);
    const [moving, setMoving] = useState(false)
    const [initialPoint,setInitialPoint] = useState({x:-1,y:-1})

    const [selectRectDrawing, setSelectRectDrawing] = useState(false)
    const [selectedElements, setSelectedElements] = useState([])
    const [selectionRectangle, setSelectionRectangle] = useState(null)
    
    const canvasRef = useRef(null);

    const tool = useSelector((state) => state.toolbox.tool);

    const getSelectedElement = (x, y) => {

        for (let i = elements.length - 1; i >= 0; i--) {

            let intersection = isIntersecting(x, y, elements[i].x1, elements[i].y1, elements[i].x2, elements[i].y2, elements[i].element.shape)

            if (intersection.collision) {
                return ({ x1: elements[i].x1, x2: elements[i].x2, y1: elements[i].y1, y2: elements[i].y2, index: i, mouseX: x, mouseY: y })
            }
        }

        return null
    }
    
   
    const mouseDownHandler = (e) => {
        const { clientX, clientY } = e;
        
        setInitialPoint({x:clientX,y:clientY})
        initialPoint.x = clientX
        initialPoint.y = clientY

        // console.log(initialPoint)


        if (tool == "selector") {
            
            // console.log("coord",clientX,clientY)
            let element = getSelectedElement(clientX, clientY)
            
            
            if(!selectionRectangle && !element){
    
                setMoving(false)
                // console.log("selection rectangle start")
                setSelectedElements([])
                setSelectRectDrawing(true)
                setSelectionRectangle({ x1: clientX, y1: clientY, x2: clientX, y2: clientY,mouseX:null,mouseY:null})
                return
            }

            if(selectionRectangle){

                setSelectRectDrawing(false)

                let {minX,minY,maxX,maxY} = minmax(selectionRectangle.x1,selectionRectangle.y1,selectionRectangle.x2,selectionRectangle.y2)

                if(minX < clientX && maxX > clientX && minY < clientY && maxY > clientY){
                    setSelectionRectangle({...selectionRectangle,mouseX:initialPoint.x,mouseY:initialPoint.y})
                    setMoving(true)
                }
                return
            }


            if (element) {

                setSelectedElements([element])
        
                    let {minX,minY,maxX,maxY} = minmax(element.x1,element.y1,element.x2,element.y2)
                    setSelectionRectangle({ x1:minX, y1:minY, x2:maxX, y2:maxY,mouseX:initialPoint.x,mouseY:initialPoint.y})
                    setMoving(true)
                    return
            }
            
        }

        setDrawing(true);
        setSelectionRectangle(null);
        setSelectedElements([]);

        const element = generateElement(clientX, clientY, clientX, clientY, tool);
        setElements((prev) => [...prev, element]);

    };
  
    
    const mouseMoveHandler = (e) => {

        const { clientX, clientY } = e;
        
        if (tool == "selector") {

            canvasRef.current.style.cursor = "pointer";

            if(selectionRectangle){

                let {x1,y1,x2,y2} = selectionRectangle
                let {minX,minY,maxX,maxY} = minmax(x1,y1,x2,y2)

                if(minX < clientX && maxX > clientX && minY < clientY && maxY > clientY){
                    canvasRef.current.style.cursor = "move";
                    // console.log("x->",minX,clientX,maxX,"\n y-> ",minY,clientY,maxY)
                }

            }else{
                let selectedElement = getSelectedElement(clientX, clientY)
                if (selectedElement) {
                    canvasRef.current.style.cursor = "move";
                }
                else{
                    canvasRef.current.style.cursor = "pointer";
                }

            }
            

            if (selectRectDrawing){
                setSelectionRectangle({ ...selectionRectangle, x2: clientX, y2: clientY })
            }

            let updatedElementsArray = []


            if (moving) {


                for (let i = 0; i < selectedElements.length; i++) {

                    let mouseX,mouseY;

                    if(selectedElements.length == 1){
                        
                        mouseX = selectedElements[0].mouseX || initialPoint.x;
                        mouseY = selectedElements[0].mouseY || initialPoint.y;
                        
                    }else{
                        mouseX = selectedElements[i].mouseX || initialPoint.x;
                        mouseY = selectedElements[i].mouseY || initialPoint.y;
                    }

                    const xOffset = clientX - mouseX
                    const yOffset = clientY - mouseY
                    // console.log("mx",mouseX,"my",mouseY,"xoff,",xOffset,"yoff",yOffset,initialPoint);
                    
                    let element;

                    let x1 = (selectedElements[i].x1 += xOffset)
                    let y1 = (selectedElements[i].y1 += yOffset)
                    let x2 = (selectedElements[i].x2 += xOffset)
                    let y2 = (selectedElements[i].y2 += yOffset)

                    if(i==0){
                        selectionRectangle.x1 += xOffset
                        selectionRectangle.y1 += yOffset
                        selectionRectangle.x2 += xOffset
                        selectionRectangle.y2 += yOffset
                    }

                    switch (elements[selectedElements[i].index].element.shape){

                        case "rectangle":
                            element = {index:selectedElements[i].index,x1, y1, x2, y2, shape:"rectangle"};
                            break; 

                        case "ellipse":
                            element = {index:selectedElements[i].index,x1, y1, x2, y2, shape:"ellipse"};
                            break;

                    }
                    updatedElementsArray.push(element)

                    selectedElements[i].mouseX = clientX
                    selectedElements[i].mouseY = clientY
                    selectionRectangle.mouseX = clientX
                    selectionRectangle.mouseY = clientY
                }
                const updatedElements = [...elements];

                for(let i = 0 ; i < updatedElementsArray.length ; i++){
                    let newElement = generateElement(
                        updatedElementsArray[i].x1,
                        updatedElementsArray[i].y1,
                        updatedElementsArray[i].x2,
                        updatedElementsArray[i].y2,
                        updatedElementsArray[i].shape);

                    updatedElements[updatedElementsArray[i].index] = newElement
                
                    
                }
                setElements(updatedElements);
            }
            return

        }

        if (drawing) {
            canvasRef.current.style.cursor = "crosshair";
            const index = elements.length - 1;
            const { x1, y1 } = elements[index];
            const element = generateElement(x1, y1, clientX, clientY, tool);
            const updatedElements = [...elements];
            updatedElements[index] = element;
            setElements(updatedElements);
        }

    };

    const getElementsInRectangle = (selectionRectangle) => {

        let flag = 0
        let min_x = 100000, min_y = 100000, max_x = 0, max_y = 0;
        let elementsInRectangle = []

        let {minX,minY,maxX,maxY} = minmax(selectionRectangle.x1,selectionRectangle.y1,selectionRectangle.x2,selectionRectangle.y2);

        let rectx1 = Math.min(selectionRectangle.x1,selectionRectangle.x2)
        let recty1 = Math.min(selectionRectangle.y1,selectionRectangle.y2)
        let rectx2 = Math.max(selectionRectangle.x1,selectionRectangle.x2)
        let recty2 = Math.max(selectionRectangle.y1,selectionRectangle.y2)

        for (let i = 0; i < elements.length; i++) {

            let x1 = Math.min(elements[i].x1,elements[i].x2)
            let y1 = Math.min(elements[i].y1,elements[i].y2)
            let x2 = Math.max(elements[i].x1,elements[i].x2)
            let y2 = Math.max(elements[i].y1,elements[i].y2)
    

            if (x1 > rectx1 && y1 > recty1 && x2 < rectx2 && y2 < recty2) {
                flag = 1
                // console.log("element in rect")
                // console.log(selectionRectangle)
                if (min_x > x1) {
                    min_x = x1
                }
                if (min_y > y1) {
                    min_y = y1
                }
                if (max_x < x2) {
                    max_x = x2
                }
                if (max_y < y2) {
                    max_y = y2
                }
                elementsInRectangle.push({ x1: elements[i].x1, y1: elements[i].y1, x2: elements[i].x2, y2: elements[i].y2, index: i, mouseX: null, mouseY:null})

            }


        }
        if (flag && maxX != 0 && maxY != 0) {

            setSelectedElements(elementsInRectangle)

            // console.log({ x1: minX, y1: minY, x2: maxX, y2: maxY })

            return { x1: min_x, y1: min_y, x2: max_x, y2: max_y ,mouseX:null, mouseY:null }

        } else {

            return null
        }

    }

    const mouseUpHandler = (e) => {
        
        
        canvasRef.current.style.cursor = "pointer";
        setMoving(false)
        setDrawing(false);

        if (selectionRectangle && selectRectDrawing) {
            let newSelectionRectangle = getElementsInRectangle(selectionRectangle)
            // console.log("newSelectionRectangle==",newSelectionRectangle,"moving==",moving,"selectionRectangle==",selectionRectangle)
            
            if (newSelectionRectangle) {
                // console.log("newSelectionRectangle===",newSelectionRectangle)
                setSelectionRectangle(newSelectionRectangle)
                setMoving(false)
                setSelectRectDrawing(false)
                
            }else{
                
                setSelectionRectangle(null)
            }

        }else{
            setSelectionRectangle(null)
            setSelectRectDrawing(false)
            setSelectedElements([])
        }
    };

    // renderer

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.height = window.innerHeight
        canvas.width = window.innerWidth
        const roughCanvas = rough.canvas(canvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // console.log(selectedElements)

        if (selectionRectangle) {
            roughCanvas.rectangle(
                selectionRectangle.x1 - 5,
                selectionRectangle.y1 - 5,
                (selectionRectangle.x2 - selectionRectangle.x1) + 10,
                (selectionRectangle.y2 - selectionRectangle.y1) + 10,
                { roughness: 0, stroke: "purple", fill: "rgba(255,0,255,0.1)", fillStyle: "solid" });
        }

        elements.map((element) => { roughCanvas.draw(element.element) });

    }, [elements, selectedElements,selectionRectangle]);

    return (
        <canvas
            ref={canvasRef}
            className="bg-[#f7f7ff]"
            onMouseDown={mouseDownHandler}
            onMouseMove={mouseMoveHandler}
            onMouseUp={mouseUpHandler}
        ></canvas>
    );
};

export default Canvas;
