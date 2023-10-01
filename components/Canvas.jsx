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



const Canvas = () => {

    //for testing
    // const noOfElements = 10000
    // const [elements, setElements] = useState(new Array(noOfElements).fill(0).map(()=>generateElement(Math.random()*500,Math.random()*500,Math.random()*500,Math.random()*500,"rectangle")));

    const [elements, setElements] = useState([]);
    const [drawing, setDrawing] = useState(false);
    const [moving, setMoving] = useState(false)
    const [selRectMove, setSelRectMove] = useState(false)
    const [selectedElements, setSelectedElements] = useState([])
    const [selectionRectangle, setSelectionRectangle] = useState(null)
    const canvasRef = useRef(null);

    const tool = useSelector((state) => state.toolbox.tool);

    const getSelectedElement = (x, y) => {

        for (let i = elements.length - 1; i >= 0; i--) {

            let intersection = isIntersecting(x, y, elements[i].x1, elements[i].y1, elements[i].x2, elements[i].y2, elements[i].element.shape)

            if (intersection.collision) {
                console.log(intersection,i)
                return ({ x1: elements[i].x1, x2: elements[i].x2, y1: elements[i].y1, y2: elements[i].y2, index: i, mouseX: x, mouseY: y })
            }
        }

        return null
    }


    const mouseDownHandler = (e) => {
        const { clientX, clientY } = e;

        if (tool == "selector") {

            if(selectionRectangle){

                let minX = Math.min(selectionRectangle.x1, selectionRectangle.x2)
                let maxX = Math.max(selectionRectangle.x1, selectionRectangle.x2)
                let minY = Math.min(selectionRectangle.y1, selectionRectangle.y2)
                let maxY = Math.max(selectionRectangle.y1, selectionRectangle.y2)

                if(minX < clientX && maxX > clientX && minY < clientY && maxY > clientY){
                    setMoving(true)
                }
                setSelectionRectangle({...selectionRectangle,mouseX:clientX,mouseY:clientY})
                return
            }


            let element = getSelectedElement(clientX, clientY)

            if (element) {

                setSelectedElements([element])
            
                    let x1 = Math.min(element.x1, element.x2)
                    let x2 = Math.max(element.x1, element.x2)
                    let y1 = Math.min(element.y1, element.y2)
                    let y2 = Math.max(element.y1, element.y2)
                    setSelectionRectangle({ x1:element.x1, y1:element.y1, x2:element.x2, y2:element.y2 })
        
            
                setMoving(true)

            }else{

                setMoving(false)
                console.log("selection rectangle start")
                setSelectedElements([])
                setSelRectMove(true)
                setSelectionRectangle({ x1: clientX, y1: clientY, x2: clientX, y2: clientY,mouseX:clientX,mouseY:clientY})

            }

            

            return
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

                let minX = Math.min(selectionRectangle.x1, selectionRectangle.x2)
                let maxX = Math.max(selectionRectangle.x1, selectionRectangle.x2)
                let minY = Math.min(selectionRectangle.y1, selectionRectangle.y2)
                let maxY = Math.max(selectionRectangle.y1, selectionRectangle.y2)

                if(minX < clientX && maxX > clientX && minY < clientY && maxY > clientY){
                    console.log(minX,clientX,maxX)
                    canvasRef.current.style.cursor = "move";
                }

            }else{
                canvasRef.current.style.cursor = "pointer";

            }

            if (!selectionRectangle) {

                let selectedElement = getSelectedElement(clientX, clientY)
                
                if (selectedElement) {
                    canvasRef.current.style.cursor = "move";
                } else {
                    canvasRef.current.style.cursor = "pointer";
                }

            }

            if (selRectMove){
                setSelectionRectangle({ ...selectionRectangle, x2: clientX, y2: clientY })
            }
            let updatedElementsArray = []


            if (moving) {
                for (let i = 0; i < selectedElements.length; i++) {
                    let mouseX,mouseY;

                    if(selectedElements.length == 1){
                        
                        mouseX = selectedElements[0].mouseX;
                        mouseY = selectedElements[0].mouseY;
                        console.log(selectedElements)
                    }else{
                        mouseX = selectedElements[i].mouseX || selectionRectangle.mouseX;
                        mouseY = selectedElements[i].mouseY || selectionRectangle.mouseY;
                    }
                    
                    const xOffset = clientX - mouseX
                    const yOffset = clientY - mouseY

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

                    if(selectedElements.length == 1){
                        selectedElements[0].mouseX = clientX
                        selectedElements[0].mouseY = clientY
                    }
                    selectedElements[i].mouseX = clientX
                    selectedElements[i].mouseY = clientY
                    selectionRectangle.mouseX = clientX
                    selectionRectangle.mouseY = clientY
                }
                // console.log(updatedElementsArray)
                const updatedElements = [...elements];

                for(let i = 0 ; i < updatedElementsArray.length ; i++){
                    let newElement = generateElement(
                        updatedElementsArray[i].x1,
                        updatedElementsArray[i].y1,
                        updatedElementsArray[i].x2,
                        updatedElementsArray[i].y2,
                        updatedElementsArray[i].shape);

                     console.log(i)
                    updatedElements[updatedElementsArray[i].index] = newElement
                
                    
                }
                setElements(updatedElements);
            }
            return

        }


        if (!drawing) {
            return
        };


        if (tool !== "selector" && drawing) {
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
        let minX = 100000, minY = 100000, maxX = 0, maxY = 0;
        let elementsInRectangle = []

        for (let i = 0; i < elements.length; i++) {

            let x1 = Math.min(elements[i].x1,elements[i].x2)
            let y1 = Math.min(elements[i].y1,elements[i].y2)
            let x2 = Math.max(elements[i].x1,elements[i].x2)
            let y2 = Math.max(elements[i].y1,elements[i].y2)
            let rectx1 = Math.min(selectionRectangle.x1,selectionRectangle.x2)
            let recty1 = Math.min(selectionRectangle.y1,selectionRectangle.y2)
            let rectx2 = Math.max(selectionRectangle.x1,selectionRectangle.x2)
            let recty2 = Math.max(selectionRectangle.y1,selectionRectangle.y2)
    

            if (x1 > rectx1 && y1 > recty1 && x2 < rectx2 && y2 < recty2) {
                flag = 1
                // console.log("element in rect")
                // console.log(selectionRectangle)
                console.log({ x1, y1, x2, y2 })
                if (minX > x1) {
                    minX = x1
                }
                if (minY > y1) {
                    minY = y1
                }
                if (maxX < x2) {
                    maxX = x2
                }
                if (maxY < y2) {
                    maxY = y2
                }
                elementsInRectangle.push({ x1: elements[i].x1, y1: elements[i].y1, x2: elements[i].x2, y2: elements[i].y2, index: i, mouseX: selectionRectangle.mouseX, mouseY: selectionRectangle.mouseY })

            }


        }
        if (flag && maxX != 0 && maxY != 0) {

            setSelectedElements(elementsInRectangle)

            // console.log({ x1: minX, y1: minY, x2: maxX, y2: maxY })

            return { x1: minX, y1: minY, x2: maxX, y2: maxY ,mouseX: selectionRectangle.mouseX, mouseY: selectionRectangle.mouseY }

        } else {

            return null
        }

    }

    const mouseUpHandler = (e) => {
        canvasRef.current.style.cursor = "pointer";
        // console.log(elements);
        setMoving(false)
        setDrawing(false);
        if (selectionRectangle) {
            let newSelectionRectangle = getElementsInRectangle(selectionRectangle)
            // console.log(newSelectionRectangle)
            
            if (newSelectionRectangle) {
                setSelectionRectangle(newSelectionRectangle)
                setMoving(false)
                setSelRectMove(false)
                
            }else{
                
                setSelectionRectangle(null)
            }

        }else{
            setSelectionRectangle(null)
            setSelRectMove(false)
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
