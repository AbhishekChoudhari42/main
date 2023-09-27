"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import rough from "roughjs";
const generator = rough.generator();

const generateElement = (x1, y1, x2, y2, tool) => {
  console.log(tool);
  let element;
  switch (tool) {
    case "line":
      element = generator.line(x1, y1, x2, y2);
      break;
    case "rectangle":
      element = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      break;
    case "circle":
      element = generator.circle(
        x1,
        y1,
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      );
      break;
    default:
      break;
  }
  return { x1, y1, x2, y2, element };
};

const Canvas = () => {
  const [elements, setElements] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef(null);
  const tool = useSelector((state) => state.toolbox.tool);

  const mouseDownHandler = (e) => {
    setDrawing(true);
    const { clientX, clientY } = e;
    const element = generateElement(clientX, clientY, clientX, clientY, tool);
    setElements((prev) => [...prev, element]);
  };
  const mouseMoveHandler = (e) => {
    if (!drawing) return;
    if (tool !== "selector") {
      canvasRef.current.style.cursor = "crosshair";

      const { clientX, clientY } = e;
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      const element = generateElement(x1, y1, clientX, clientY, tool);
      const updatedElements = [...elements];
      updatedElements[index] = element;
      setElements(updatedElements);
    }
  };
  const mouseUpHandler = (e) => {
    setDrawing(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const roughCanvas = rough.canvas(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.map((element) => roughCanvas.draw(element.element));
  }, [elements]);

  console.log(elements);

  return (
    <canvas
      ref={canvasRef}
      className="bg-[#f7f7ff]"
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={mouseDownHandler}
      onMouseMove={mouseMoveHandler}
      onMouseUp={mouseUpHandler}
    ></canvas>
  );
};

export default Canvas;
