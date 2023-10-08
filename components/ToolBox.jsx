"use client";

import React from "react";
import { BiPencil, BiPointer } from "react-icons/bi";

import { FaRegCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { changeTool } from "@/features/Toolbox/toolboxSlice";

import { PiRectangleBold } from "react-icons/pi";
import { HiOutlineMinus } from "react-icons/hi";

const ToolBox = () => {
  const tool = useSelector((state) => state.toolbox.tool);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="absolute top-5  ">
        <div className=" shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded-md mt-2  flex px-4 space-x-2 py-1 justify-between   items-center">
          <div
            className={`p-2  cursor-pointer rounded ${
              tool === "selector" ? "bg-[#bbd0ff] text-white" : ""
            } hover:bg-[#bbd0ff] hover:text-white `}
            onClick={() => dispatch(changeTool("selector"))}
          >
            <BiPointer color="#2b2d42" size={20} />
          </div>
          <div
            className={`p-2  cursor-pointer rounded ${
              tool === "line" ? "bg-[#bbd0ff]" : ""
            } hover:bg-[#bbd0ff] hover:text-white `}
            onClick={() => dispatch(changeTool("line"))}
          >
            <HiOutlineMinus color="#2b2d42" size={20} />
          </div>
          <div
            className={`p-2  cursor-pointer rounded ${
              tool === "rectangle" ? "bg-[#bbd0ff]" : ""
            } hover:bg-[#bbd0ff] hover:text-white `}
            onClick={() => dispatch(changeTool("rectangle"))}
          >
            <PiRectangleBold color="#2b2d42" size={20} />
          </div>
          <div
            className={`p-2  cursor-pointer rounded ${
              tool === "ellipse" ? "bg-[#bbd0ff]" : ""
            } hover:bg-[#bbd0ff] hover:text-white `}
            onClick={() => dispatch(changeTool("ellipse"))}
          >
            <FaRegCircle color="#2b2d42" className="font-bold" size={18} />
          </div>
          <div
            className={`p-2  cursor-pointer rounded ${
              tool === "pencil" ? "bg-[#bbd0ff]" : ""
            } hover:bg-[#bbd0ff] hover:text-white `}
            onClick={() => dispatch(changeTool("pencil"))}
          >
            <BiPencil color="#2b2d42" className="font-bold" size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolBox;
