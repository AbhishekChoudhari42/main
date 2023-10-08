"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import rough from "roughjs";
import { isIntersecting } from "@/utils/collision";
import getStroke from "perfect-freehand";
import getSvgPathFromStroke from "@/utils/getSvgPathFromStroke";

const generator = rough.generator();

const generateElement = (x1, y1, x2, y2, tool) => {

    let element;

    switch (tool) {
        case "line":
            element = generator.line(x1, y1, x2, y2);
            break;
        case "rectangle":
            element = generator.rectangle(x1, y1, x2 - x1, y2 - y1,{ roughness: 0.5, fill: 'red' });
            break;
        case "ellipse":
            element = generator.ellipse(
                Math.round((x1+x2)/2),
                Math.round((y1+y2)/2),
                Math.round(x2-x1),
                Math.round(y2-y1),
                { roughness: 0.5, fill: 'blue' }
            );
            break;
        
        default:
            break;
    }
    return { x1, y1, x2, y2, element };
};


//useState for storing freehand
// pull from git
// cleanup the code
const Canvas = () => {

    //for testing
    // const noOfElements = 10000
    // const [elements, setElements] = useState(new Array(noOfElements).fill(0).map(()=>generateElement(Math.random()*500,Math.random()*500,Math.random()*500,Math.random()*500,"rectangle")));

    const [elements, setElements] = useState([]);
    const [drawing, setDrawing] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null)
    const [PerfectPoints,setPerfectPoints] = useState([])
    const canvasRef = useRef(null);
    // const pathRef = useRef()
    const [pathList,setPathList] = useState([])

    const tool = useSelector((state) => state.toolbox.tool);
    const getSelectedElement = (x, y) => {
        for (let i = elements.length - 1; i >= 0; i--) {

            let intersection = isIntersecting(x, y, elements[i].x1, elements[i].y1, elements[i].x2, elements[i].y2,elements[i].element.shape)

            if (intersection.collision){
                console.log(intersection.shape)
                return ({ x1: elements[i].x1, x2: elements[i].x2, y1: elements[i].y1, y2: elements[i].y2, index: i, mouseX: x, mouseY: y })
            }
        }
        return null
    }

    const handlePointerDown = (e) => {
        console.log(e);
        e.target.setPointerCapture(e.pointerId)
        setPerfectPoints([[e.pageX,e.pageY,e.pressure]])
    }
    // console.log(PerfectPoints);

    const handlePointerMove = (e) => {
        if(e.buttons !== 1) return
        setPerfectPoints([...PerfectPoints,[e.pageX,e.pageY,e.pressure]])
    } 

    const handlePointerUp = (e) => {
        const stroke = getStroke(PerfectPoints,{
            size: 16,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
        })
        const pathData = getSvgPathFromStroke(stroke)
    
        const canvasPath = new Path2D(pathData)

        
        setPathList([...pathList,canvasPath])
    }
    
    const mouseDownHandler = (e) => {
        
        const { clientX, clientY } = e;

        if (tool == "selector") {
            let element = getSelectedElement(clientX, clientY)
            console.log(element)
            if (element) {
                setSelectedElement(element)
            }
            return
        }

        setDrawing(true);
        const element = generateElement(clientX, clientY, clientX, clientY, tool);
        setElements((prev) => [...prev, element]);

    };

    const mouseMoveHandler = (e) => {

        const { clientX, clientY } = e;

        if (tool == "selector") {

            if (getSelectedElement(clientX, clientY)) {
                canvasRef.current.style.cursor = "move";
            } else {
                canvasRef.current.style.cursor = "pointer";
            }



            if (selectedElement) {
                console.log(elements[selectedElement.index].element.shape)
                const { mouseX, mouseY } = selectedElement;
                const xOffset = clientX - mouseX
                const yOffset = clientY - mouseY
                let element;
                switch (elements[selectedElement.index].element.shape) {
                    case "rectangle":
                        element = generateElement(
                            selectedElement.x1 += xOffset,
                            selectedElement.y1 += yOffset,
                            selectedElement.x2 += xOffset,
                            selectedElement.y2 += yOffset,
                            "rectangle");
                        break;

                    case "ellipse":
                        element = generateElement(
                            selectedElement.x1 += xOffset,
                            selectedElement.y1 += yOffset,
                            selectedElement.x2 += xOffset,
                            selectedElement.y2 += yOffset,
                            "ellipse");
                        break;
                }


                const updatedElements = [...elements];
                
                updatedElements[selectedElement.index] = element;
                setElements(updatedElements);
        
                selectedElement.mouseX = clientX
                selectedElement.mouseY = clientY
            }

            return

        }


        if (!drawing) return;


        if (tool !== "selector") {
            canvasRef.current.style.cursor = "crosshair";
            const index = elements.length - 1;
            const { x1, y1 } = elements[index];
            const element = generateElement(x1, y1, clientX, clientY, tool);
            const updatedElements = [...elements];
            updatedElements[index] = element;
            setElements(updatedElements);
        }


    };

    const mouseUpHandler = (e) => {
        canvasRef.current.style.cursor = "pointer";
        // console.log(elements);
        setDrawing(false);
        setSelectedElement(null)
    };

    useEffect(() => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.height = window.innerHeight
        canvas.width = window.innerWidth
        const roughCanvas = rough.canvas(canvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        elements.map((element) =>  roughCanvas.draw(element.element));

        pathList.map(path => ctx.fill(path))

    }, [elements,pathList]);

    const canvasProps = {}    
    if(tool === 'pencil') {     
        canvasProps.onPointerDown = handlePointerDown
        canvasProps.onPointerUp = handlePointerUp
        canvasProps.onPointerMove = handlePointerMove
    }else {
        canvasProps.onMouseDown = mouseDownHandler
        canvasProps.onMouseMove = mouseMoveHandler
        canvasProps.onMouseUp = mouseUpHandler
    }

    
    return (
        <canvas
            ref={canvasRef}
            className="bg-[#f7f7ff]"
            {...canvasProps}
        ></canvas>
    );
};

export default Canvas;
